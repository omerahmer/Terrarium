import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const faqs = [
  {
    question: "What is Terrarium?",
    answer:
      "Terrarium is a visual AWS infrastructure designer. You drag AWS resources onto a canvas, connect them to define relationships, and the AI generates production-ready Terraform HCL from your diagram. It's designed for engineers who want to move fast without hand-writing infrastructure code.",
  },
  {
    question: "Do I need to know Terraform to use Terrarium?",
    answer:
      "No. Terrarium is designed so you can design infrastructure visually and get valid Terraform as output without writing a single line of HCL yourself. That said, the Monaco editor lets you inspect and edit the generated code if you want full control.",
  },
  {
    question: "Which AWS services are supported?",
    answer:
      "Terrarium currently supports 20+ AWS services including EC2, VPC, S3, RDS, Lambda, ECS, ECR, IAM, CloudWatch, SNS, SQS, API Gateway, DynamoDB, ALB, NLB, ELB, Route 53, CloudFront, EBS, EFS, and ElastiCache. More services are added regularly.",
  },
  {
    question: "Is my infrastructure data sent anywhere?",
    answer:
      "Your canvas diagram is sent to your own backend (Go API) which forwards it to your own Python AI service. That service calls the Anthropic API using your own API key. Nothing is stored on any third-party server. If you self-host Terrarium, all data stays entirely within your own infrastructure.",
  },
  {
    question: "Does the generated Terraform actually work?",
    answer:
      "Terrarium includes a LangGraph validation agent that runs terraform validate on the generated code and sends any errors back to Claude to self-correct — looping up to 3 times until the code is valid. This is currently in development and will ship in a future release.",
  },
  {
    question: "Is Terrarium free to use?",
    answer:
      "Yes. Terrarium is fully open source and free to self-host. You only need an Anthropic API key for the AI generation features, which is billed directly by Anthropic based on your usage. There is no Terrarium subscription or usage fee.",
  },
];

export default function FAQ() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-3xl">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">
            FAQ
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-foreground">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-muted-foreground">
            Everything you need to know about Terrarium.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Common questions</CardTitle>
            <CardDescription>
              Can't find what you're looking for? Open an issue on GitHub.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-sm font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
