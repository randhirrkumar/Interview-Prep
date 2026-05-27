const hrQuestions = {
  title: 'HR & Behavioral Questions',
  description: 'Tell me about yourself, career gap handling, job switch reasons, salary negotiation, and behavioral answers.',
  tags: ['HR', 'Behavioral', 'STAR', 'Gap', 'Notice Period'],
  sections: [
    {
      id: 'intro',
      title: 'Introduction & Tell Me About Yourself',
      questions: [
        {
          id: 1,
          question: 'Tell me about yourself',
          type: 'intro',
          answer: `I'm Randhir Kumar, a Java Backend Developer with around 4 years of hands-on experience building scalable backend systems.

My core expertise is in Java, Spring Boot, and Microservices architecture. I've worked with event-driven systems using Apache Kafka, REST API design, and cloud deployment.

I've worked on two significant projects:

At Adani Groups' EPLMS project — which is a real-time vehicle tracking and logistics automation platform — I was responsible for building high-performance REST APIs and integrating Kafka-based event processing. We processed 10,000+ events per day and I personally reduced API response times by 30%.

Before that at Cognizant, I worked on MetLife Insurance's policy and claims management system — building RESTful APIs handling 10,000+ daily transactions and implementing Spring Security for authentication.

Right now I'm actively looking for my next role where I can work on challenging backend systems, contribute to architecture decisions, and continue growing as an engineer.

I'm particularly drawn to roles that involve distributed systems, event-driven architecture, and high-scale backend development.`,
          tip: 'Keep it under 2 minutes. Structure: current expertise → key projects → what you\'re looking for. Don\'t read from a script — practice until it sounds natural.',
        },
        {
          id: 2,
          question: 'Why are you looking for a job change?',
          type: 'switch',
          answer: `Honestly, there are two reasons.

First, I want to grow technically. The EPLMS project was great — I learned a lot about Kafka, real-time systems, and microservices. But I feel I've reached a point where I need new challenges and exposure to different domains, different architectural decisions, and different scale problems.

Second, I want to work in an environment where there's more structured engineering culture, more code reviews, more opportunity to contribute beyond just writing code — like participating in system design, technical discussions, and architecture decisions.

I'm not leaving out of frustration. I'm leaving because I'm hungry to grow, and I believe this is the right time in my career to make that move.`,
          tip: 'Never say "salary" as the first reason. Lead with growth and technical exposure. Salary can be mentioned as secondary only if asked directly.',
        },
      ],
    },
    {
      id: 'gap',
      title: 'Gap & Career Transition Handling',
      questions: [
        {
          id: 10,
          question: 'Why was there a gap between Cognizant and Amazin Automation?',
          type: 'gap',
          answer: `So there was about a 5-6 month gap between Cognizant and Amazin Automation. Let me be honest about it.

After 2+ years at Cognizant, I felt I needed to step back and be deliberate about my next move rather than just jumping to any available offer. I had been in service-based companies and I wanted to make sure I moved somewhere I could actually grow technically, work on more complex systems, and take ownership.

During that time, I was actively upskilling — I did a deep dive into Kafka and event-driven architecture because I knew that was the direction backend systems were moving. I also studied distributed systems and microservices patterns more seriously.

I interviewed at a few companies but I didn't accept offers that didn't align with what I was looking for. I'm glad I took that time because when Amazin came along with the EPLMS project involving Kafka, microservices, and real-time tracking — it was exactly what I was preparing for.

So the gap was intentional, skill-focused, and I used it productively.`,
          followUp: [
            'Can you be more specific about what you studied?',
            'Why did it take 5-6 months? Couldn\'t you have found something sooner?',
            'Were you dealing with any personal issues?',
          ],
          recovery: `If pushed on why it took so long:

"I was selective. I turned down a couple of offers that I didn't feel were the right fit. I know it might look like a long gap on paper, but I'd rather take 5 months to join the right place than join immediately and leave in 6 months. The Amazin role was worth the wait — I've been consistently growing there."`,
          tip: 'Be calm, confident, and specific. Saying "I was selective and upskilling" is honest and professional. Don\'t be defensive — own it matter-of-factly.',
          mistakes: [
            'Over-explaining or apologizing for the gap',
            'Saying you couldn\'t find a job (sounds like you were rejected everywhere)',
            'Lying about what you did during the gap',
            'Getting nervous or stumbling over the answer',
          ],
        },
        {
          id: 11,
          question: 'If your current job ends and you\'re job searching for 2-3 months, how will you handle that question in interviews?',
          type: 'gap',
          answer: `If asked about a gap after leaving Amazin Automation:

"After Amazin Automation, I decided to take a focused break to prepare for my next move properly. I spent that time deepening my knowledge in system design, going through distributed systems concepts, practicing coding problems, and specifically preparing for backend engineering roles at stronger companies.

I also took time to explore what kind of company, team, and technical culture I wanted to be part of — because joining the wrong place is worse than taking two extra months to find the right one.

I've been speaking with companies, doing interviews, and I'm genuinely excited about this role because [specific reason related to the company/role]."

Key tone: calm, self-assured, not apologetic.`,
          followUp: [
            '"But why did it take 2 months to find a job? Shouldn\'t it be faster for someone with your skills?"',
            '"Are you facing issues with companies rejecting you?"',
          ],
          recovery: `For "why 2 months":

"Finding the right fit takes time. Getting an offer is one thing — but I'm also evaluating each company on culture, tech stack, growth potential, and team quality. I've had offers but they weren't the right fit. I'd rather take 2 months to join somewhere I'll thrive for 2 years than join in 2 weeks and leave in 6 months."

This is a confident, mature answer that shows self-awareness.`,
          tip: 'Never sound desperate in an interview. The question "why 2 months?" is a pressure test. Answer calmly — you were being selective. That\'s a GOOD trait for a developer.',
          mistakes: [
            'Saying "I was unemployed" — say "I was selectively interviewing"',
            'Listing all the companies that rejected you',
            'Over-justifying each week of the gap',
            'Looking nervous or defensive',
          ],
        },
        {
          id: 12,
          question: '"Are you currently employed or unemployed?" — How to handle if you\'re on notice period or have left',
          type: 'gap',
          answer: `If serving notice period at Amazin:
"I'm currently in my notice period at Amazin Automation. I've given my notice and my last day is [date]. I wanted to use this time to properly prepare and find the right next opportunity rather than rushing."

If left and searching:
"I recently transitioned out of my previous role. I left on good terms and I've been focused on finding the right next opportunity. I'm currently actively interviewing and I'm particularly excited about this role because [specific reason]."

If on a short break:
"I'm between roles right now. I took a deliberate short break after Amazin Automation to reset, upskill, and be intentional about my next move. I've been actively exploring opportunities for the past X weeks."

Key: Always frame it positively and forward-looking. Never sound like you're in distress.`,
          tip: 'Recruiters ask this to gauge urgency and whether you\'re "available immediately." Say you\'re "actively looking" and can join within 2-4 weeks typically.',
        },
        {
          id: 13,
          question: 'Why should we hire you over someone who is currently working?',
          type: 'pressure',
          answer: `I understand why you'd consider that — someone currently employed might signal higher demand. But I'd argue that's not always the right measure.

What matters is what I bring to the table. I have 4 years of hands-on experience building production systems — real-time Kafka architectures, microservices, Spring Boot APIs that handled 10,000+ daily transactions. I've debugged production issues, optimized queries from 8 seconds to 50 milliseconds, and built systems that reduced manual effort by 40%.

Someone currently employed isn't necessarily more skilled — they're just currently employed. My skills, experience, and drive to contribute are what should matter in this decision.

And honestly, the fact that I'm available sooner means I can add value to your team faster.`,
          tip: 'Never be defensive. This is a confidence test. Answer directly, point to your value, and slightly redirect to why availability sooner is an advantage.',
        },
      ],
    },
    {
      id: 'behavioral',
      title: 'Behavioral & STAR Questions',
      questions: [
        {
          id: 20,
          question: 'Tell me about a time you solved a difficult production issue',
          type: 'behavioral',
          answer: `In my EPLMS project, we had a critical production issue where our Kafka consumer was processing vehicle check-in events but some events were being silently dropped — about 2-3% of all events weren't making it through.

The impact was serious — vehicle check-in records were missing, causing billing errors and operational disruption.

I investigated by:
1. First checked Kafka consumer lag — it was normal, so the consumer was keeping up
2. Checked application logs — saw deserialization warnings for some messages
3. Found that some mobile app versions were sending malformed JSON (a field name mismatch after an app update)
4. The consumer was catching the deserialization exception and logging a warning, but then committing the offset — effectively swallowing the error

I fixed it by:
- Making the error handler send failed messages to a Dead Letter Topic instead of silently discarding them
- Added schema validation before publishing events
- Added metrics to track deserialization failures
- Reprocessed all failed events from the DLT

The fix took about 4 hours from discovery to deployment. We recovered all the lost events and had zero data loss going forward.

The lesson: never silently handle errors in Kafka consumers. Failed messages must go somewhere trackable.`,
          tip: 'STAR format: Situation → Task → Action → Result. Be specific. Numbers make your story credible.',
        },
        {
          id: 21,
          question: 'Tell me about how you improved the performance of a feature',
          type: 'behavioral',
          answer: `In MetLife, we had a reports API that was taking 8-12 seconds to load the policy summary for a customer. Users and business complained constantly.

I profiled the query and found:
1. It was loading ALL policy fields even though the UI only needed 5 columns
2. There was an N+1 problem — for each policy, it was loading the customer separately
3. The query wasn't using any index on the status + created_date columns

I fixed it by:
1. Changed to a DTO projection — only SELECT the 5 fields needed
2. Added JOIN FETCH to eliminate N+1 (one query instead of 1+N)
3. Added a composite index on (customer_id, status, created_at)
4. Added pagination (the original was loading all records — sometimes 5000+)

Result: The API went from 8-12 seconds to under 200ms. A 95% improvement.

This experience taught me that the Hibernate default behavior of loading full entities is often the first performance anti-pattern to look for.`,
        },
        {
          id: 22,
          question: 'What is your biggest weakness?',
          type: 'behavioral',
          answer: `Honestly, one area I've been working on is — I sometimes get too absorbed in making something technically elegant when a simpler solution would serve the business better.

For example, early in a project I'd spend extra time designing a perfectly abstracted service layer when the requirement was actually simple enough for a direct approach.

I've learned to ask "does this complexity actually solve a real problem?" before going deep on architecture. I still love clean design, but now I balance it with pragmatism and delivery speed.

The other thing I'm actively improving is explaining technical decisions to non-technical stakeholders. I've been working on translating complex technical trade-offs into business impact language.`,
          tip: 'Give a REAL weakness but one that doesn\'t disqualify you for the role. Always pair it with what you\'re doing to improve it. Never say "I work too hard" — interviewers see through it.',
        },
        {
          id: 23,
          question: 'Where do you see yourself in 3-5 years?',
          type: 'behavioral',
          answer: `In 3-5 years, I see myself as a senior engineer who is deeply involved in architecture decisions — not just building features but helping design systems that scale.

I want to deepen my expertise in distributed systems, high-performance backends, and cloud-native architecture. I'm particularly interested in working on systems that handle significant scale — millions of events, complex data pipelines, or real-time processing.

I'm also interested in mentoring junior developers. I've started doing informal code reviews and architecture discussions with my current colleagues and I enjoy sharing what I've learned.

I don't have a hard target of "tech lead in 3 years" because I think titles matter less than capability and impact. But I want to be the kind of engineer whose opinion on architecture carries real weight because of depth of experience.`,
        },
      ],
    },
    {
      id: 'salary',
      title: 'Salary & Notice Period',
      questions: [
        {
          id: 30,
          question: 'What are your salary expectations?',
          type: 'salary',
          answer: `Based on my 4 years of experience with Spring Boot, Kafka, microservices, and cloud deployments, and based on current market rates for backend engineers in this domain, I'm targeting somewhere in the range of [X to Y LPA].

That said, I'm flexible — the total package, growth opportunity, and the work itself matter to me as much as the number. I'm open to discussing what works for both of us.

What's the budgeted range for this role?`,
          tip: 'Always give a range, not a fixed number. Then immediately ask for their range — this gives you negotiating information. Research market rates beforehand on Glassdoor, LinkedIn, AmbitionBox.',
        },
        {
          id: 31,
          question: 'What is your current notice period?',
          type: 'notice',
          answer: `My notice period is [30/60/90] days. However, I can discuss early release with my current employer if needed — I have a good relationship there and they understand professional transitions.

I'm happy to discuss a start date that works best for your team. What's your urgency for filling this role?`,
          tip: 'Be honest about your notice period. Offering to negotiate early release shows flexibility without overpromising. Don\'t say "I can join immediately" if you can\'t — it damages trust.',
        },
        {
          id: 32,
          question: 'Why should we hire you?',
          type: 'closing',
          answer: `Because I bring real-world experience in exactly what this role needs.

I've built production systems handling thousands of daily events with Kafka and Spring Boot. I've solved N+1 performance issues that cut response times from 8 seconds to 200ms. I've implemented event-driven microservices architectures and deployed them on cloud platforms.

More than that — I'm not someone who only knows textbook theory. I've faced real production fires, debugged complex distributed system issues, and improved systems that real users depend on.

I'm at a point in my career where I'm hungry to work on harder problems, in a stronger team, and contribute to architecture-level decisions. I believe this role gives me that opportunity, and in return you get someone who will show up with genuine enthusiasm and deliver.`,
          tip: 'Be direct. Don\'t be modest. The interviewer is asking you to sell yourself — do it. Combine experience specifics with genuine enthusiasm.',
        },
      ],
    },
  ],
}

export default hrQuestions
