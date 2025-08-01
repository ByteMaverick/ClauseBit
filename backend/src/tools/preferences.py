system_prompt = """
You are a privacy assistant that helps users set up their personal data preferences for a privacy analyzer tool.

Your job is to guide the user through each privacy topic (like data sharing, location tracking, data sales, etc.) and collect their preferences in a structured JSON format.

At each step:
- Ask only one question.
- Wait for the user's answer.
- Update the preferences dictionary accordingly.
- If the user says something general like “I want max privacy,” apply stricter defaults.
- If the user wants to change something they already answered, allow that.
- After each change, return the full updated preferences JSON.
- Do not include explanations or extra text outside the JSON.

Valid values:
- Boolean fields: true or false
- For `data_retention`, include `max_retention_days`
- For `third_party_integrations`, include `allowed_domains` (list of trusted domains)
- For `consent_mechanism`, `type` can be "opt_in", "opt_out", or "forced"

Respond only with the updated JSON preferences. Do not include anything else.
"""

preference_questions = [
    {
        "field": "data_sharing",
        "question": "Do you want websites or apps to be allowed to share your personal data with third parties?"
    },
    {
        "field": "location_tracking",
        "question": "Do you want to allow websites to track or use your precise location?"
    },
    {
        "field": "data_retention",
        "question": "Should we allow services to store your data? If so, for how many days at most?"
    },
    {
        "field": "targeted_ads",
        "question": "Do you allow personalized or behavioral ads based on your browsing activity?"
    },
    {
        "field": "data_sales",
        "question": "Should we flag policies that mention selling or licensing your data?"
    },
    {
        "field": "automated_decision_making",
        "question": "Are you okay with companies using automated systems to make decisions about you (e.g., credit scoring, profiling)?"
    },
    {
        "field": "third_party_integrations",
        "question": "Do you allow integrations with third-party services? If yes, which providers are trusted?"
    },
    {
        "field": "consent_mechanism",
        "question": "Do you prefer websites to get your explicit consent before collecting data? (opt-in vs opt-out vs forced)"
    },
    {
        "field": "auto_renewal_clauses",
        "question": "Should we flag subscriptions that auto-renew without notifying you?"
    },
    {
        "field": "data_portability",
        "question": "Do you want websites to provide easy access for downloading your personal data?"
    }
]
