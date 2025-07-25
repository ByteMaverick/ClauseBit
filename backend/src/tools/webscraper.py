import requests
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_vertexai import ChatVertexAI
from auth.init_vertex import init_vertex_ai
import nest_asyncio
import re
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.output_parsers import JsonOutputParser
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup

nest_asyncio.apply()

async def extract_footer_links_async(url: str):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(url, timeout=60000)

        # Instead of waiting for footer, grab all links
        links = await page.query_selector_all("a")

        policy_links = []
        for link in links:
            href = await link.get_attribute("href")
            text = (await link.inner_text()).strip()
            if href and any(kw in href.lower() or kw in text.lower() for kw in ["privacy", "terms", "cookie", "policy", "legal", "gdpr", "data", "notice", "agreement"]):
                policy_links.append({
                    "text": text,
                    "href": href
                })

        await browser.close()

        bruteforce = ["privacy","privacy-policy","legal/privacy","terms","terms-of-service","cookie-policy","policies"]
        if len(policy_links) == 0:

            for link in bruteforce:
                url_valid = url + link
                try:
                    response = requests.get(url_valid, timeout=5)
                    if response.status_code == 200:
                        print("URL is reachable.")
                        policy_links.append(url_valid)
                    else:
                        print(f"URL returned status code: {response.status_code}")
                except requests.exceptions.RequestException as e:(
                    print(f"URL is not reachable. Error: {e}"))




        init_vertex_ai()
        llm = ChatVertexAI(
            model="gemini-2.0-flash-lite",
            temperature=0.8,
            max_output_tokens=8000
        )

        template = ChatPromptTemplate.from_messages([
            ("system",
             "You are an intelligent policy analyst. Your task is to identify and return only the most relevant footer links related to official legal documents such as Terms of Service, Privacy Policies, and Cookie Policies."),

            ("human",
             """
        Here are the extracted footer links:
        {footer_links}

        Step 1: Check if each link is valid (i.e., complete and properly formed).
        Step 2: For any relative links, join the root domain: {url} with the link if the link is link this /c/Terms_of_Use return, and url is https://www.homedepot.com/ return https://www.homedepot.com/c/Terms_of_Use return
        Step 3: Filter and return only the top three most relevant  links that point to official policy-related pages — specifically Terms of Service, Privacy Policy, or Cookie Policy.

        Output the final list in the same format as the input (with 'text' and 'href' keys), containing only valid and relevant policy links.
        """)
        ])

        base_chain = template | llm | JsonOutputParser()

        output = base_chain.invoke({"footer_links": policy_links,"url": url})


        return output


from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
from bs4 import BeautifulSoup
import requests


async def extract_fully_rendered_page(url: str) -> str:
    try:
        # First attempt: Use Playwright for dynamic content
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()

            try:
                await page.goto(url, timeout=20000, wait_until="networkidle")
                content = await page.content()
                print("✅ Playwright succeeded, so this is not the issue")
                return content

            finally:
                await browser.close()

    except PlaywrightTimeout:
        print("⚠️ Timeout in Playwright, falling back to BeautifulSoup...")

    except Exception as e:
        print(f"⚠️ Playwright failed due to {e}, falling back to BeautifulSoup...")

    # Fallback: Use requests + BeautifulSoup (static HTML only)
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        print("✅ Fallback using BeautifulSoup succeeded")
        return soup.prettify()
    except Exception as e:
        print(f"❌ Both methods failed: {e}")
        return ""


async def process_company_policies(company_url):
    footer_links = await extract_footer_links_async(company_url)

    policies_list = []
    for link in footer_links:
        href = link["href"]
        if href.startswith("/"):
            href = company_url.rstrip("/") + href

        print(f"extracting from {link}")
        page_content = await extract_fully_rendered_page(href)

        metadata = None


        policies_list.append({
            "content": page_content,
            "metadata": metadata
        })
    print("done")
    return policies_list


def clean_policy_text(text: str) -> str:
    # Remove duplicated navigation and menu content
    lines = text.splitlines()

    # Remove lines that are too short or very generic UI strings
    lines = [line.strip() for line in lines if len(line.strip()) > 20 and not re.match(r'^(Search|Sign up|Open menu|GitHub Docs|Copilot|Home|Site policy|Version)', line)]

    # Collapse back into cleaned text
    cleaned_text = "\n".join(lines)

    # Optional: find first real section
    match = re.search(r'(A\. Definitions|Effective date:)', cleaned_text)
    if match:
        cleaned_text = cleaned_text[match.start():]

    return cleaned_text


from datetime import datetime, timezone
from urllib.parse import urlparse

async def chunking(company_url):
    print("Chunking the data!")
    pages =  await process_company_policies(company_url)

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=5000,
        chunk_overlap=100,
        separators=["\n\n", "\n", ".", " "]
    )


    t = [clean_policy_text(page["content"]) for page in pages]

    # Wrap the content and metadata in lists
    chunks = text_splitter.create_documents(
        texts=t,
        metadatas=None
    )

    llm = ChatVertexAI(
        model="gemini-2.0-flash-lite",
        temperature=0.8,
        max_output_tokens=5000
    )
    print("generating the metadata tags with con ")
    prompt = ChatPromptTemplate.from_messages([
        ("system",
         '''You are a policy analyzer that generates structured metadata for pre-chunked legal content (e.g., Terms of Service, Privacy Policies). Your output will be used for semantic retrieval, privacy risk detection, and clause-level reasoning in downstream AI applications.'''),

        ("human", '''Given the following policy text, generate a **JSON object** that includes structured metadata fields.

    Use this schema(If something None remove the schema ex if"risk_tags": None remove it! ):
    - "source_url": {url}.
    - "domain": {url}.
    - "scrape_date": {timestamp}
    - "language": The detected language (e.g., "en").
    - "policy_type": One of: "privacy_policy", "terms_of_service", "cookie_policy", "acceptable_use", "other"
    - "risk_tags": comma seperated  detected privacy or legal risks (e.g., "data_sharing, location_tracking", etc.)
    - "section_title": Descriptive title for this chunk. If none is found, infer one.
    - "summary": A 1–2 sentence plain-English summary of what the chunk means.
    - "categories": comma seperated high-level topics (e.g., "data_collection", "user_rights", etc.)
    - "user_impact_level": One of "low", "medium", or "high" based on how much the policy affects the user's rights or data.

    Return **only one JSON object**. No markdown, no code formatting, and no extra explanation.

    Policy Text:
    """
    {data}
    """
    ''')
    ])

    import asyncio
    semaphore = asyncio.Semaphore(50)  # Max 5 concurrent calls
    async def enrich_metadata_async(chunk, company_url):
        async with semaphore:
            timestamp = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
            base_chain = prompt | llm | JsonOutputParser()
            response = await base_chain.ainvoke({
                "data": chunk.page_content,
                "url": company_url,
                "timestamp": timestamp
            })
            chunk.metadata = response

    async def enrich_all_chunks(chunks, company_url):
        tasks = [enrich_metadata_async(chunk, company_url) for chunk in chunks]
        await asyncio.gather(*tasks)

    await enrich_all_chunks(chunks, company_url)

    return chunks


# And change the main to:
if __name__ == "__main__":
    import asyncio
    url = "https://www.ebay.com/"

    result = asyncio.run(extract_footer_links_async(url))
    print(result)





