const mongoose = require("mongoose");
const Ticket = require("./models/Ticket");
const User = require("./models/User");
const dotenv = require("dotenv");
const { faker } = require("@faker-js/faker");

// Load environment variables
dotenv.config();

// CONFIGURATION OPTIONS
const TOTAL_TICKETS = 100; // Change this to generate more or fewer tickets
const MAX_RESPONSES_PER_TICKET = 5;
const DATE_RANGE_DAYS = 5; // Tickets will be created within this many days from now

// Ticket titles by category for more realistic ticket data
const ticketTemplates = {
  Hardware: [
    {
      title: "Computer won't turn on",
      description: "My desktop computer won't power on at all.",
    },
    {
      title: "Monitor display issues",
      description: "Screen is flickering and showing distorted colors.",
    },
    {
      title: "Printer not connecting",
      description: "Can't get printer to connect to my computer.",
    },
    {
      title: "Laptop battery draining too fast",
      description: "Battery only lasts 30 minutes on a full charge.",
    },
    {
      title: "Keyboard keys not working",
      description: "Several keys on my keyboard are unresponsive.",
    },
    {
      title: "Strange noises from computer",
      description: "Hearing clicking sounds from inside the computer case.",
    },
    {
      title: "Headphones not detected",
      description: "Computer doesn't recognize when headphones are plugged in.",
    },
  ],
  Software: [
    {
      title: "Cannot install application",
      description: "Installation fails at 75% with error code 0x80070643.",
    },
    {
      title: "Excel crashes when opening large files",
      description: "My spreadsheet crashes Excel whenever I try to open it.",
    },
    {
      title: "Windows updates failing",
      description: "Updates download but fail to install properly.",
    },
    {
      title: "Application license expired",
      description: "Need assistance renewing my software license.",
    },
    {
      title: "Software running extremely slowly",
      description: "Program takes several minutes to perform simple tasks.",
    },
    {
      title: "Cannot save documents",
      description: "Getting 'access denied' errors when trying to save files.",
    },
    {
      title: "Email client not syncing",
      description: "New emails aren't showing up in my email application.",
    },
  ],
  Network: [
    {
      title: "Cannot connect to WiFi",
      description: "Unable to connect to the office wireless network.",
    },
    {
      title: "VPN connection issues",
      description: "VPN disconnects every few minutes when working remotely.",
    },
    {
      title: "Slow internet speeds",
      description: "Downloads and web browsing are extremely slow today.",
    },
    {
      title: "Unable to access network drives",
      description: "Can't connect to the shared department drive.",
    },
    {
      title: "Email delivery delayed",
      description: "Sent emails are taking hours to be delivered.",
    },
    {
      title: "Cannot access specific website",
      description:
        "Getting 'connection refused' errors for an important work site.",
    },
    {
      title: "Video calls keep freezing",
      description: "My Teams/Zoom calls constantly freeze during meetings.",
    },
  ],
  Security: [
    {
      title: "Suspicious emails received",
      description: "Getting unusual emails asking for password verification.",
    },
    {
      title: "Need password reset",
      description: "Locked out of my account after too many login attempts.",
    },
    {
      title: "Potential virus alert",
      description:
        "Antivirus software detected a threat but couldn't remove it.",
    },
    {
      title: "Unauthorized login attempt",
      description:
        "Received notification of login attempt from unknown location.",
    },
    {
      title: "Permission issues with files",
      description: "Can't access documents I should have rights to view.",
    },
    {
      title: "Data breach concerns",
      description:
        "Worried my information was compromised in recent company incident.",
    },
    {
      title: "MFA not working",
      description: "Not receiving authentication codes on my phone.",
    },
  ],
  Account: [
    {
      title: "Need access to department database",
      description: "Requesting access to the marketing analytics database.",
    },
    {
      title: "Account locked out",
      description: "Can't log in despite using correct password.",
    },
    {
      title: "Email signature not updating",
      description: "Changed my signature but old one still appears in emails.",
    },
    {
      title: "New employee setup",
      description: "Need accounts created for new team member starting Monday.",
    },
    {
      title: "Change user permissions",
      description: "Need elevated access to the document management system.",
    },
    {
      title: "Email forwarding setup",
      description:
        "Need to forward all messages to my assistant during vacation.",
    },
    {
      title: "Username change request",
      description: "Would like my username updated after recent name change.",
    },
  ],
  Other: [
    {
      title: "Office equipment request",
      description: "Need a second monitor for my workstation.",
    },
    {
      title: "Conference room tech support",
      description: "Projector in Meeting Room B isn't working.",
    },
    {
      title: "Software license request",
      description: "Need Adobe Creative Suite for design work.",
    },
    {
      title: "Mobile device enrollment",
      description: "Need help setting up work email on my new phone.",
    },
    {
      title: "Training request",
      description: "Looking for resources to learn advanced Excel functions.",
    },
    {
      title: "Desk phone not working",
      description: "Office phone giving busy signal for all incoming calls.",
    },
    {
      title: "Building access issues",
      description: "Key card not working at the parking garage entrance.",
    },
  ],
};

// Response templates for more realistic ticket interactions
const responseTemplates = [
  "I've looked into your issue and need some additional information. When did you first notice this problem?",
  "Thank you for reporting this. Have you tried restarting the device/application?",
  "I've replicated the issue on my end and am working on a solution.",
  "This appears to be related to a recent update. We're working on a fix.",
  "Could you please provide your device model and operating system version?",
  "I've escalated this to our specialized team for further investigation.",
  "This issue has been resolved in our latest update. Please download version X.Y.Z.",
  "We've identified the root cause and are implementing a fix.",
  "Have you made any recent changes to your system that might have triggered this?",
  "I'm sending you a link to a troubleshooting guide that should help resolve this.",
  "Our team is currently working on this known issue. We expect resolution within 24 hours.",
  "Could you please send a screenshot of the error message you're receiving?",
  "I've reset your account permissions. Please try logging in again in 15 minutes.",
];

// Internal response templates
const internalResponseTemplates = [
  "Checked logs, seeing network timeout errors. Might be related to recent firewall changes.",
  "User has outdated hardware according to our records. Might need to suggest an upgrade.",
  "This issue is becoming common. We should consider a broader communication to affected departments.",
  "User has contacted support about similar issues three times this month.",
  "I've checked with the network team, and they confirmed ongoing issues with the VPN server.",
  "This appears to be user error, but I'll provide clear instructions to prevent recurrence.",
  "We need to escalate this to development as it seems to be a product bug.",
  "Low priority issue, but we should document this for future reference.",
  "Asset management shows this device is out of warranty. User might need to go through procurement for replacement.",
  "This is a known limitation of the current system version. User needs to be informed of the workaround.",
];

// Random date generator
const randomDate = (start, end) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

// Main seeding function
const seedTickets = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for ticket seeding");

    // Remove existing tickets
    await Ticket.deleteMany({});
    console.log("Cleared existing tickets");

    // Fetch users by role
    const regularUsers = await User.find({ role: "user" });
    const admins = await User.find({ role: "admin" });
    const firstLineSupport = await User.find({ role: "firstLineSupport" });
    const secondLineSupport = await User.find({ role: "secondLineSupport" });

    console.log(
      `Found users - Regular: ${regularUsers.length}, Admins: ${admins.length}, First Line: ${firstLineSupport.length}, Second Line: ${secondLineSupport.length}`
    );

    if (regularUsers.length === 0) {
      console.error("No regular users found. Please run seed.js first.");
      process.exit(1);
    }

    const supportUsers = [...firstLineSupport, ...secondLineSupport, ...admins];

    // Ticket generation
    const tickets = [];
    const categories = [
      "Hardware",
      "Software",
      "Network",
      "Security",
      "Account",
      "Other",
    ];
    const statuses = [
      "open",
      "in progress",
      "resolved",
      "completed",
      "needs development",
      "reopened",
    ];
    const priorities = ["low", "medium", "high", "urgent"];

    // Current date and date range for historical tickets
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - DATE_RANGE_DAYS);

    // Distribution counters
    const stats = {
      byCategory: {},
      byStatus: {},
      byPriority: {},
      bySupportLevel: { firstLine: 0, secondLine: 0 },
      assigned: 0,
      unassigned: 0,
      withResponses: 0,
      totalResponses: 0,
    };

    categories.forEach((category) => (stats.byCategory[category] = 0));
    statuses.forEach((status) => (stats.byStatus[status] = 0));
    priorities.forEach((priority) => (stats.byPriority[priority] = 0));

    // Create tickets
    for (let i = 0; i < TOTAL_TICKETS; i++) {
      // Select random category
      const category =
        categories[Math.floor(Math.random() * categories.length)];
      stats.byCategory[category]++;

      // Select random template for that category
      const templates = ticketTemplates[category];
      const template = templates[Math.floor(Math.random() * templates.length)];

      // Randomize user
      const user =
        regularUsers[Math.floor(Math.random() * regularUsers.length)];

      // Randomize created date within range
      const createdAt = randomDate(startDate, now);

      // Determine status with weighted distribution
      // Older tickets more likely to be resolved/completed
      let status;
      const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);
      const ageRatio = daysSinceCreation / DATE_RANGE_DAYS;

      if (ageRatio > 0.8) {
        // Very old tickets - mostly completed or resolved
        status =
          Math.random() > 0.3
            ? Math.random() > 0.7
              ? "needs development"
              : "completed"
            : Math.random() > 0.5
            ? "resolved"
            : "in progress";
      } else if (ageRatio > 0.4) {
        // Medium age - mix of statuses
        const r = Math.random();
        if (r < 0.3) status = "in progress";
        else if (r < 0.6) status = "resolved";
        else if (r < 0.8) status = "completed";
        else status = Math.random() > 0.5 ? "needs development" : "reopened";
      } else {
        // Newer tickets - mostly open or in progress
        status = Math.random() > 0.6 ? "in progress" : "open";
      }

      stats.byStatus[status]++;

      // Randomize priority with weighted distribution
      let priority;
      const r = Math.random();
      if (r < 0.4) priority = "medium";
      else if (r < 0.7) priority = "low";
      else if (r < 0.9) priority = "high";
      else priority = "urgent";
      stats.byPriority[priority]++;

      // Determine support level and potential escalation
      const supportLevel = Math.random() > 0.2 ? "firstLine" : "secondLine";
      stats.bySupportLevel[supportLevel]++;

      // Determine if ticket is assigned (based on status)
      let assignedTo = null;
      let assignmentHistory = [];
      let escalatedFrom = null;
      let escalatedAt = null;

      if (status !== "open") {
        // Non-open tickets have higher chance of being assigned
        if (Math.random() > 0.2) {
          if (supportLevel === "firstLine") {
            assignedTo =
              firstLineSupport[
                Math.floor(Math.random() * firstLineSupport.length)
              ]._id;
          } else {
            assignedTo =
              secondLineSupport[
                Math.floor(Math.random() * secondLineSupport.length)
              ]._id;
            // If second line, add escalation data
            escalatedFrom =
              firstLineSupport[
                Math.floor(Math.random() * firstLineSupport.length)
              ]._id;
            escalatedAt = new Date(
              createdAt.getTime() +
                (Math.random() * (now.getTime() - createdAt.getTime())) / 2
            );

            // Add assignment history entry for the escalation
            assignmentHistory.push({
              assignedTo: assignedTo,
              assignedBy: escalatedFrom,
              supportLevel: "secondLine",
              assignedAt: escalatedAt,
            });
          }

          // Add initial assignment to history
          const initialAssigner =
            admins[Math.floor(Math.random() * admins.length)]._id;
          assignmentHistory.unshift({
            assignedTo: assignedTo,
            assignedBy: initialAssigner,
            supportLevel:
              supportLevel === "secondLine" ? "firstLine" : supportLevel,
            assignedAt: new Date(
              createdAt.getTime() + Math.random() * 1000 * 60 * 60 * 24
            ), // within a day of creation
          });

          stats.assigned++;
        } else {
          stats.unassigned++;
        }
      } else {
        stats.unassigned++;
      }

      // Create status history
      const statusHistory = [];
      statusHistory.push({
        status: "open",
        updatedBy: user._id,
        updatedAt: createdAt,
      });

      if (status !== "open") {
        // Add "in progress" for tickets that moved beyond open
        const inProgressDate = new Date(
          createdAt.getTime() + Math.random() * 1000 * 60 * 60 * 24 * 2
        ); // 0-2 days after creation
        statusHistory.push({
          status: "in progress",
          updatedBy:
            assignedTo || admins[Math.floor(Math.random() * admins.length)]._id,
          updatedAt: inProgressDate,
        });

        // Add additional status changes for resolved/completed/etc.
        if (["resolved", "completed", "needs development"].includes(status)) {
          const resolvedDate = new Date(
            inProgressDate.getTime() +
              Math.random() * (now.getTime() - inProgressDate.getTime()) * 0.8
          );
          statusHistory.push({
            status: status,
            updatedBy:
              assignedTo ||
              admins[Math.floor(Math.random() * admins.length)]._id,
            updatedAt: resolvedDate,
          });

          // Some tickets get reopened and then resolved again
          if (Math.random() < 0.15) {
            const reopenedDate = new Date(
              resolvedDate.getTime() + Math.random() * 1000 * 60 * 60 * 24 * 3
            ); // 0-3 days after resolution
            if (reopenedDate < now) {
              statusHistory.push({
                status: "reopened",
                updatedBy: user._id,
                updatedAt: reopenedDate,
              });

              // And then back to resolved/completed if the current status isn't "reopened"
              if (status !== "reopened") {
                const finalResolveDate = new Date(
                  reopenedDate.getTime() +
                    Math.random() * (now.getTime() - reopenedDate.getTime())
                );
                statusHistory.push({
                  status: status,
                  updatedBy:
                    assignedTo ||
                    admins[Math.floor(Math.random() * admins.length)]._id,
                  updatedAt: finalResolveDate,
                });
              }
            }
          }
        }
      }

      // Determine completion date for completed tickets
      let completedAt = null;
      if (status === "completed") {
        completedAt =
          statusHistory.find((sh) => sh.status === "completed")?.updatedAt ||
          null;
      }

      // Create responses (if any)
      const responses = [];
      const shouldHaveResponses = status !== "open" && Math.random() > 0.1;

      if (shouldHaveResponses) {
        stats.withResponses++;

        // Number of responses depends on ticket age and complexity
        const responseCount = Math.min(
          1 + Math.floor(Math.random() * MAX_RESPONSES_PER_TICKET),
          Math.ceil(daysSinceCreation / 3)
        );

        stats.totalResponses += responseCount;

        // Generate response timeline starting shortly after ticket creation
        let lastResponseTime = new Date(
          createdAt.getTime() + 1000 * 60 * (15 + Math.random() * 60)
        ); // 15-75 minutes after creation

        for (let j = 0; j < responseCount; j++) {
          // Alternate between support staff and user responses, starting with staff
          const isStaff = j % 2 === 0;
          const isInternal = isStaff && Math.random() < 0.3; // 30% chance of internal notes for staff responses

          // Select a respondent
          const respondent = isStaff
            ? supportUsers[Math.floor(Math.random() * supportUsers.length)]._id
            : user._id;

          // Select response text
          let text;
          if (isInternal) {
            text =
              internalResponseTemplates[
                Math.floor(Math.random() * internalResponseTemplates.length)
              ];
          } else {
            text =
              responseTemplates[
                Math.floor(Math.random() * responseTemplates.length)
              ];

            // Add some personalization/customization to responses
            if (Math.random() > 0.7) {
              if (isStaff) {
                text += ` Please let me know if this helps with your ${category.toLowerCase()} issue.`;
              } else {
                text += ` I'm still experiencing this problem with my ${faker.commerce.productName()}.`;
              }
            }
          }

          // Add the response
          responses.push({
            text,
            respondedBy: respondent,
            isInternal,
            createdAt: lastResponseTime,
          });

          // Set up time for next response (0.5 - 24 hours later)
          const nextResponseDelay = 1000 * 60 * 30 * (1 + Math.random() * 47); // 30 minutes to 24 hours
          lastResponseTime = new Date(
            lastResponseTime.getTime() + nextResponseDelay
          );

          // Don't add responses beyond current date
          if (lastResponseTime > now) break;
        }
      }

      // Create the complete ticket object
      tickets.push({
        title: template.title,
        description:
          Math.random() > 0.3
            ? template.description
            : template.description +
              " " +
              faker.lorem.paragraph(1 + Math.floor(Math.random() * 3)),
        category,
        status,
        priority,
        supportLevel,
        user: user._id,
        assignedTo,
        responses,
        assignmentHistory,
        statusHistory,
        escalatedFrom,
        escalatedAt,
        completedAt,
        devWorkRequired:
          status === "needs development" ||
          (status !== "open" && Math.random() < 0.1),
        createdAt,
      });

      // Add some randomness to ticket titles for variety
      if (Math.random() > 0.7) {
        const lastTicket = tickets[tickets.length - 1];
        if (Math.random() > 0.5) {
          lastTicket.title = `Urgent: ${lastTicket.title}`;
        } else {
          lastTicket.title = `${
            lastTicket.title
          } - ${faker.company.buzzPhrase()}`;
        }
      }
    }

    // Save tickets to database
    await Ticket.insertMany(tickets);

    // Log statistics
    console.log(`\nSuccessfully created ${tickets.length} tickets!`);
    console.log("\nTicket Distribution Statistics:");
    console.log("-----------------------------");
    console.log("\nBy Category:");
    Object.entries(stats.byCategory).forEach(([category, count]) => {
      console.log(
        `${category}: ${count} (${Math.round((count / TOTAL_TICKETS) * 100)}%)`
      );
    });

    console.log("\nBy Status:");
    Object.entries(stats.byStatus).forEach(([status, count]) => {
      console.log(
        `${status}: ${count} (${Math.round((count / TOTAL_TICKETS) * 100)}%)`
      );
    });

    console.log("\nBy Priority:");
    Object.entries(stats.byPriority).forEach(([priority, count]) => {
      console.log(
        `${priority}: ${count} (${Math.round((count / TOTAL_TICKETS) * 100)}%)`
      );
    });

    console.log("\nBy Support Level:");
    Object.entries(stats.bySupportLevel).forEach(([level, count]) => {
      console.log(
        `${level}: ${count} (${Math.round((count / TOTAL_TICKETS) * 100)}%)`
      );
    });

    console.log("\nAssignment Status:");
    console.log(
      `Assigned: ${stats.assigned} (${Math.round(
        (stats.assigned / TOTAL_TICKETS) * 100
      )}%)`
    );
    console.log(
      `Unassigned: ${stats.unassigned} (${Math.round(
        (stats.unassigned / TOTAL_TICKETS) * 100
      )}%)`
    );

    console.log("\nResponse Statistics:");
    console.log(
      `Tickets with responses: ${stats.withResponses} (${Math.round(
        (stats.withResponses / TOTAL_TICKETS) * 100
      )}%)`
    );
    console.log(`Total responses: ${stats.totalResponses}`);
    console.log(
      `Average responses per ticket with responses: ${(
        stats.totalResponses / stats.withResponses
      ).toFixed(2)}`
    );
    console.log(
      `Average responses across all tickets: ${(
        stats.totalResponses / TOTAL_TICKETS
      ).toFixed(2)}`
    );

    mongoose.connection.close();
    console.log("\nDatabase connection closed");
  } catch (error) {
    console.error("Error seeding tickets:", error);
    process.exit(1);
  }
};

// Run the seeding function
seedTickets();
