# links
from urllib.parse import urljoin


from langchain_google_vertexai import ChatVertexAI
# Scaper imports
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
from langchain_core.prompts import ChatPromptTemplate
from datetime import datetime, timezone
import requests

#LANGCHAIN
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.output_parsers import JsonOutputParser
from langchain_google_vertexai import ChatVertexAI


from auth.init_vertex import init_vertex_ai
from backend.src.tools.datatracker import add_company


def extract_main_text(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")

    for tag in soup(["script", "style", "noscript", "header", "footer", "svg", "meta", "nav", "aside", "form"]):
        tag.decompose()

    container = soup.find("main") or soup.find("article") or soup.body
    if not container:
        return ""

    # 🔧 FIX: Loosen or remove this filter
    lines = container.get_text(separator="\n").splitlines()
    lines = [line.strip() for line in lines if len(line.strip()) > 5]  # Changed from 30 to 5
    return "\n".join(lines)


class ScraperManager:
    def __init__(self):
        # Google Vertex AI Authentication
        init_vertex_ai()
        self.llm = ChatVertexAI(
            model="gemini-2.0-flash-lite",
            temperature=0.8,
            max_output_tokens=8000
        )

    async def detect_bot_verification(self, page):
        """
        Detect if the current page is a bot verification/CAPTCHA page
        Returns True if bot verification is detected, False otherwise
        """
        try:
            # Check page title for common bot detection indicators
            title = await page.title()
            title_lower = title.lower()

            bot_title_keywords = [
                "verify", "captcha", "robot", "human", "security check",
                "access denied", "blocked", "cloudflare", "just a moment",
                "checking your browser", "ddos protection", "rate limit"
            ]

            if any(keyword in title_lower for keyword in bot_title_keywords):
                print(f"🤖 Bot verification detected in title: {title}")
                return True

            # Check for common bot detection elements
            bot_selectors = [
                # Cloudflare
                ".cf-browser-verification",
                "#cf-wrapper",
                ".cf-checking-browser",

                # Generic CAPTCHA
                "[data-callback*='captcha']",
                ".g-recaptcha",
                ".h-captcha",
                ".captcha",

                # Access denied pages
                ".access-denied",
                ".blocked",

                # Rate limiting
                ".rate-limit",
                ".too-many-requests",

                # Security checks
                ".security-check",
                ".verification-required"
            ]

            for selector in bot_selectors:
                element = await page.query_selector(selector)
                if element:
                    print(f"🤖 Bot verification detected by selector: {selector}")
                    return True

            # Check page content for bot detection text
            page_content = await page.content()
            content_lower = page_content.lower()

            bot_text_indicators = [
                "verify you are human",
                "complete the captcha",
                "security check",
                "checking your browser",
                "just a moment",
                "ddos protection",
                "cloudflare",
                "access denied",
                "rate limited",
                "too many requests",
                "suspicious activity"
            ]

            for indicator in bot_text_indicators:
                if indicator in content_lower:
                    print(f"🤖 Bot verification detected by text: '{indicator}'")
                    return True

            # Check for redirect to verification pages
            current_url = page.url
            verification_url_patterns = [
                "captcha", "verify", "security", "blocked", "denied",
                "cloudflare", "ddos", "rate-limit"
            ]

            if any(pattern in current_url.lower() for pattern in verification_url_patterns):
                print(f"🤖 Bot verification detected in URL: {current_url}")
                return True

            return False

        except Exception as e:
            print(f"⚠️ Error during bot detection: {e}")
            return False

    async def extract_footer_links_async(self, url: str):
        async with async_playwright() as p:

            browser = await p.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-dev-shm-usage"]
            )
            page = await browser.new_page()

            try:
                await page.goto(url, timeout=60000)
            except Exception as e:
                print(f"❌ Failed to load {url}: {e}")
                add_company(url, False,"❌ Failed to load {url}: {e}")
                await browser.close()
                return [{
                "text": f"❌ Failed to load {url}: {e}",
                "href": url
            }]

            # Check for bot verification page
            if await self.detect_bot_verification(page):
                print(f"🚫 Skipping {url} - Bot verification detected")

                add_company(url,False,"Skipping {url} - Bot verification detected")
                print("WHat the fuck is wrong ")
                await browser.close()

                return [{
                    "text": f"🚫 Skipping {url} - Bot verification detected",
                    "href": url
            }]

            # Instead of waiting for footer, grab all links
            links = await page.query_selector_all("a")

            policy_links = []

            for link in links:
                href = await link.get_attribute("href")
                text = (await link.inner_text()).strip()
                relevant_keyword =  ["privacy", "terms", "cookie", "policy", "legal", "gdpr", "data", "notice","agreement"]
                if href and any(kw in href.lower() or kw in text.lower() for kw in relevant_keyword):
                    # Join relative links to full URL
                    full_url = urljoin(url, href)

                    policy_links.append({
                        "text": text,
                        "href": full_url
                    })


            bruteforce_paths = [
                "privacy", "privacy-policy", "legal/privacy", "terms",
                "terms-of-service", "cookie-policy", "policies",
                "legal", "legal/terms", "privacy.html", "terms.html"
            ]

            if len(policy_links) == 0:
                for link in bruteforce_paths:
                    url_valid = urljoin(url, link)
                    try:
                        response = requests.get(url_valid, timeout=5)
                        if response.status_code == 200:
                            print("URL is reachable.")
                            policy_links.append({
                        "text": link,
                        "href": url_valid
                    })
                        else:
                            print(f"URL returned status code: {response.status_code}")
                    except requests.exceptions.RequestException as e:
                        (
                            print(f"URL is not reachable. Error: {e}"))

            await browser.close()

        return policy_links

    async def extract_fully_rendered_page(self, url: str) -> str:
        try:
            # First attempt: Use Playwright for dynamic content
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True, args=["--no-sandbox"])
                page = await browser.new_page()

                try:
                    await page.goto(url, timeout=20000, wait_until="networkidle")
                    html = await page.content()
                    print("✅ Playwright succeeded, so this is not the issue")
                    return extract_main_text(html)

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
            print("✅ Fallback using BeautifulSoup succeeded")
            return extract_main_text(response.text)

        except Exception as e:
            print(f"❌ Both methods failed: {e}")
            return ""

    async def process_company_policies(self,company_url):
        footer_links = await self.extract_footer_links_async(company_url)
        policies_list = []


        for link in footer_links:
            href = link["href"]

            print(f"extracting from {link}")
            page_content = await self.extract_fully_rendered_page(href)

            metadata = href

            policies_list.append({
                "content": page_content,
                "metadata": metadata
            })
        print("done")
        return policies_list

    async def chunking(self, company_url):
        print("🧪 Chunking the data!")
        pages = await self.process_company_policies(company_url)

        print(f"Pages scraped: {len(pages)}")
        for idx, page in enumerate(pages):
            print(f"📄 Page {idx} content length: {len(page['content'])}")
            print(f"🔗 Source: {page['metadata']}")

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=3500,
            chunk_overlap=100,
            separators=["\n\n", "\n", ".", " "]
        )

        main_data = [page["content"] for page in pages]
        metadata_tag = [{"source": page["metadata"]} for page in pages]

        # Check if content exists
        if not any(main_data):
            print(" No valid page content found. Skipping chunking.")
            return []

        # Wrap the content and metadata in documents
        chunks = text_splitter.create_documents(
            texts=main_data,
            metadatas=metadata_tag
        )

        print(f" Total chunks generated: {len(chunks)}")

        if not chunks:
            print(" Chunking failed — possibly due to empty or short text.")
            return []

        print("Generating the metadata tags with Gemini...")

        prompt = ChatPromptTemplate.from_messages([
            ("system",
             '''You are a policy analyzer that generates structured metadata for pre-chunked legal content (e.g., Terms of Service, Privacy Policies). Your output will be used for semantic retrieval, privacy risk detection, and clause-level reasoning in downstream AI applications.'''),
            ("human", '''Given the following policy text, generate a **JSON object** that includes structured metadata fields.

    Use this schema (remove any fields with None values):
    - "domain": {url}.
    - "scrape_date": {timestamp}
    - "language": Detected language (e.g., "en").
    - "policy_type": One of: "privacy_policy", "terms_of_service", "cookie_policy", "acceptable_use", "other"
    - "risk_tags": comma-separated privacy/legal risks (e.g., "data_sharing, location_tracking")
    - "section_title": Descriptive title for this chunk (infer if not present)
    - "summary": A 1–2 sentence plain-English summary
    - "categories": comma-separated topics (e.g., "data_collection", "user_rights")
    - "user_impact_level": One of "low", "medium", "high" based on user impact

    Return only one valid JSON object. No markdown, no explanation.

    Policy Text:
    """
    {data}
    """''')
        ])

        import asyncio
        semaphore = asyncio.Semaphore(15)

        async def enrich_metadata_async(chunk, company_url):
            async with semaphore:
                timestamp = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
                base_chain = prompt | self.llm | JsonOutputParser()
                try:
                    response = await base_chain.ainvoke({
                        "data": chunk.page_content,
                        "url": company_url,
                        "timestamp": timestamp
                    })
                    chunk.metadata = chunk.metadata | response
                except Exception as e:
                    print(f"❌ Metadata generation failed for chunk: {e}")

        async def enrich_all_chunks(chunks, company_url):
            tasks = [enrich_metadata_async(chunk, company_url) for chunk in chunks]
            await asyncio.gather(*tasks)

        await enrich_all_chunks(chunks, company_url)

        # Mark success
        add_company(company_url, True)

        print("Done chunking.")
        return chunks

