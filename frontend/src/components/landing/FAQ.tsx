import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What does Terrarium produce?",
    answer: "Terrarium turns the resources and relationships on your canvas into editable Terraform HCL. The generated project includes the files you expect—resources, variables, and outputs—ready to inspect before export.",
  },
  {
    question: "Do I need to know Terraform?",
    answer: "No. You can design the system visually and use the generated files as your starting point. If you do know Terraform, the built-in editor keeps you in control of every line before download.",
  },
  {
    question: "Which AWS services are supported?",
    answer: "The current catalog covers the core compute, networking, database, storage, security, and integration services—including EC2, VPC, RDS, Lambda, S3, ECS, IAM, SQS, CloudFront, and more.",
  },
  {
    question: "How is infrastructure data handled?",
    answer: "The project is open source and self-hostable. When you run your own stack, diagrams move through your own API and AI service using credentials you control.",
  },
  {
    question: "Are the cost numbers exact?",
    answer: "They are directional estimates based on modeled on-demand pricing. They help compare architectural choices, but they do not include every request charge, discount, tax, or data-transfer scenario.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="border-t border-border bg-card/30 px-5 py-24 sm:px-6 lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
        <div>
          <span className="section-kicker">Field notes</span>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Before you plant the first node.</h2>
          <p className="mt-5 max-w-sm text-sm leading-6 text-muted-foreground">
            A few practical answers about output, ownership, and what Terrarium understands today.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full border-y border-border">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`item-${index}`} className="border-border">
              <AccordionTrigger className="py-5 text-left text-base font-medium tracking-[-0.015em] hover:no-underline hover:text-primary">
                <span className="flex items-center gap-4">
                  <span className="font-mono text-[9px] tracking-wider text-muted-foreground">0{index + 1}</span>
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pl-9 text-sm leading-6 text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
