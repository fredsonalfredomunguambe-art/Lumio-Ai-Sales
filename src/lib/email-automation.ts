import nodemailer from "nodemailer";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  text: string;
  variables: string[];
}

interface EmailCampaign {
  id: string;
  name: string;
  template: EmailTemplate;
  leads: any[];
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED";
  schedule: {
    startDate: Date;
    endDate?: Date;
    frequency: "IMMEDIATE" | "DAILY" | "WEEKLY";
  };
  settings: {
    maxEmailsPerDay: number;
    delayBetweenEmails: number; // in minutes
    trackOpens: boolean;
    trackClicks: boolean;
  };
}

export class EmailAutomation {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text: string
  ): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@lumio.com",
        to,
        subject,
        html,
        text,
      });
      return true;
    } catch (error) {
      console.error("Email send error:", error);
      return false;
    }
  }

  async sendPersonalizedEmail(
    lead: any,
    template: EmailTemplate
  ): Promise<boolean> {
    try {
      const personalizedSubject = this.personalizeContent(
        template.subject,
        lead
      );
      const personalizedHtml = this.personalizeContent(template.html, lead);
      const personalizedText = this.personalizeContent(template.text, lead);

      return await this.sendEmail(
        lead.email,
        personalizedSubject,
        personalizedHtml,
        personalizedText
      );
    } catch (error) {
      console.error("Personalized email error:", error);
      return false;
    }
  }

  private personalizeContent(content: string, lead: any): string {
    let personalized = content;

    // Replace common variables
    const variables = {
      "{{firstName}}": lead.firstName || "",
      "{{lastName}}": lead.lastName || "",
      "{{fullName}}": `${lead.firstName || ""} ${lead.lastName || ""}`.trim(),
      "{{company}}": lead.company || "",
      "{{jobTitle}}": lead.jobTitle || "",
      "{{industry}}": lead.industry || "",
      "{{location}}": lead.location || "",
      "{{linkedinUrl}}": lead.linkedinUrl || "",
      "{{website}}": lead.website || "",
    };

    Object.entries(variables).forEach(([placeholder, value]) => {
      personalized = personalized.replace(new RegExp(placeholder, "g"), value);
    });

    return personalized;
  }

  async createEmailTemplate(
    template: Omit<EmailTemplate, "id">
  ): Promise<EmailTemplate> {
    const newTemplate: EmailTemplate = {
      id: `template_${Date.now()}`,
      ...template,
    };

    // In a real implementation, save to database
    return newTemplate;
  }

  async createEmailCampaign(
    campaign: Omit<EmailCampaign, "id">
  ): Promise<EmailCampaign> {
    const newCampaign: EmailCampaign = {
      id: `campaign_${Date.now()}`,
      ...campaign,
    };

    // In a real implementation, save to database
    return newCampaign;
  }

  async executeCampaign(
    campaign: EmailCampaign
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const lead of campaign.leads) {
      try {
        const success = await this.sendPersonalizedEmail(
          lead,
          campaign.template
        );
        if (success) {
          sent++;
        } else {
          failed++;
        }

        // Add delay between emails to avoid spam
        if (campaign.settings.delayBetweenEmails > 0) {
          await new Promise((resolve) =>
            setTimeout(
              resolve,
              campaign.settings.delayBetweenEmails * 60 * 1000
            )
          );
        }
      } catch (error) {
        console.error(`Failed to send email to ${lead.email}:`, error);
        failed++;
      }
    }

    return { sent, failed };
  }

  async scheduleCampaign(campaign: EmailCampaign): Promise<void> {
    // In a real implementation, this would use a job queue like Bull or Agenda
    console.log(`Scheduling campaign: ${campaign.name}`);

    if (campaign.schedule.frequency === "IMMEDIATE") {
      await this.executeCampaign(campaign);
    } else {
      // Schedule for later execution
      const delay = this.calculateDelay(campaign.schedule);
      setTimeout(() => this.executeCampaign(campaign), delay);
    }
  }

  private calculateDelay(schedule: EmailCampaign["schedule"]): number {
    const now = new Date();
    const startTime = new Date(schedule.startDate);

    if (startTime <= now) {
      return 0; // Execute immediately
    }

    return startTime.getTime() - now.getTime();
  }

  // Pre-built email templates
  static getDefaultTemplates(): EmailTemplate[] {
    return [
      {
        id: "welcome",
        name: "Welcome Email",
        subject: "Welcome to {{company}} - Let's Connect!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hi {{firstName}},</h2>
            <p>I hope this email finds you well. I came across your profile and was impressed by your work at {{company}}.</p>
            <p>I'd love to connect and learn more about your role as {{jobTitle}} in the {{industry}} industry.</p>
            <p>Would you be open to a brief 15-minute call this week?</p>
            <p>Best regards,<br>Your Name</p>
          </div>
        `,
        text: `Hi {{firstName}},\n\nI hope this email finds you well. I came across your profile and was impressed by your work at {{company}}.\n\nI'd love to connect and learn more about your role as {{jobTitle}} in the {{industry}} industry.\n\nWould you be open to a brief 15-minute call this week?\n\nBest regards,\nYour Name`,
        variables: [
          "{{firstName}}",
          "{{company}}",
          "{{jobTitle}}",
          "{{industry}}",
        ],
      },
      {
        id: "follow_up",
        name: "Follow-up Email",
        subject: "Following up on {{company}}",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hi {{firstName}},</h2>
            <p>I wanted to follow up on my previous email about connecting.</p>
            <p>I understand you're busy, but I believe there could be mutual value in a brief conversation about {{company}}'s growth in {{industry}}.</p>
            <p>Would you be available for a quick 10-minute call this week?</p>
            <p>Best regards,<br>Your Name</p>
          </div>
        `,
        text: `Hi {{firstName}},\n\nI wanted to follow up on my previous email about connecting.\n\nI understand you're busy, but I believe there could be mutual value in a brief conversation about {{company}}'s growth in {{industry}}.\n\nWould you be available for a quick 10-minute call this week?\n\nBest regards,\nYour Name`,
        variables: ["{{firstName}}", "{{company}}", "{{industry}}"],
      },
      {
        id: "meeting_reminder",
        name: "Meeting Reminder",
        subject: "Reminder: Meeting Tomorrow",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hi {{firstName}},</h2>
            <p>This is a friendly reminder about our meeting tomorrow.</p>
            <p>I'm looking forward to our conversation about {{company}} and how we might be able to help with your {{industry}} needs.</p>
            <p>Meeting details will be sent separately.</p>
            <p>Best regards,<br>Your Name</p>
          </div>
        `,
        text: `Hi {{firstName}},\n\nThis is a friendly reminder about our meeting tomorrow.\n\nI'm looking forward to our conversation about {{company}} and how we might be able to help with your {{industry}} needs.\n\nMeeting details will be sent separately.\n\nBest regards,\nYour Name`,
        variables: ["{{firstName}}", "{{company}}", "{{industry}}"],
      },
    ];
  }
}

export const emailAutomation = new EmailAutomation();
