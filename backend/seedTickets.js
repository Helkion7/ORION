const mongoose = require("mongoose");
const User = require("./models/User");
const Ticket = require("./models/Ticket");
const dotenv = require("dotenv");
const faker = require("faker");

// Load environment variables
dotenv.config();

// Configuration
const TOTAL_TICKETS = 100; // Adjust this number to generate more or fewer tickets
const MAX_RESPONSES_PER_TICKET = 5;
const TICKETS_WITH_RESPONSES_PERCENT = 70; // % of tickets that will have responses
const TICKETS_ASSIGNED_PERCENT = 60; // % of tickets that will be assigned to admins
const TICKETS_SOLVED_PERCENT = 30; // % of tickets that will be in "solved" status

// Max time range for ticket creation (in days)
const MAX_DAYS_PAST = 60; // Tickets will be created between now and this many days ago

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected for ticket seeding"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

// Helper function to get random item from array
const getRandomItem = (array) =>
  array[Math.floor(Math.random() * array.length)];

// Helper function to get random date between now and X days ago
const getRandomDate = (daysAgo) => {
  const now = new Date();
  const pastDate = new Date(now);
  pastDate.setDate(now.getDate() - Math.floor(Math.random() * daysAgo));
  return pastDate;
};

// Helper to randomly determine if something should happen based on percentage
const shouldHappen = (percentChance) => Math.random() < percentChance / 100;

// Ticket category arrays
const TICKET_CATEGORIES = [
  "Hardware",
  "Software",
  "Network",
  "Security",
  "Account",
  "Other",
];
const TICKET_PRIORITIES = ["low", "medium", "high", "urgent"];
const TICKET_STATUSES = ["open", "in progress", "solved"];

// Hardware issue templates
const hardwareIssues = [
  {
    title: "Computer won't turn on",
    description:
      "When I press the power button, nothing happens. I've checked the power cable and it's plugged in correctly.",
  },
  {
    title: "Monitor display is flickering",
    description:
      "My screen keeps flickering every few minutes, making it difficult to work.",
  },
  {
    title: "Printer not connecting",
    description:
      "I can't get my printer to connect to my computer. I've tried reinstalling the drivers but it still doesn't work.",
  },
  {
    title: "Keyboard keys not responding",
    description:
      "Several keys on my keyboard have stopped working, specifically the A, S, and D keys.",
  },
  {
    title: "Overheating laptop",
    description:
      "My laptop gets extremely hot after just 30 minutes of use and then shuts down automatically.",
  },
  {
    title: "Headphones not detected",
    description:
      "When I plug my headphones in, the computer doesn't recognize them and continues playing sound through speakers.",
  },
];

// Software issue templates
const softwareIssues = [
  {
    title: "Application crashes on startup",
    description:
      "The software crashes immediately when I try to open it. I've already tried reinstalling it.",
  },
  {
    title: "Unable to save documents",
    description:
      "When I try to save my work, I get an error message saying 'Access Denied'.",
  },
  {
    title: "Software running extremely slow",
    description:
      "The application takes several minutes to perform basic operations that used to be instant.",
  },
  {
    title: "Feature not working as expected",
    description:
      "The search functionality doesn't return any results, even for items I know exist in the database.",
  },
  {
    title: "Update failed",
    description:
      "When trying to update the software to the latest version, it gets to 80% and then gives an error.",
  },
  {
    title: "Missing menu options",
    description:
      "Some of the menu options that should be available are not showing up in the interface.",
  },
];

// Network issue templates
const networkIssues = [
  {
    title: "Cannot connect to internet",
    description:
      "My computer says it's connected to WiFi but I can't access any websites.",
  },
  {
    title: "VPN connection keeps dropping",
    description:
      "I'm experiencing frequent disconnections from the VPN, approximately every 15 minutes.",
  },
  {
    title: "Extremely slow network speed",
    description:
      "File downloads that should take minutes are taking hours to complete.",
  },
  {
    title: "Unable to access shared drives",
    description:
      "I can't access the department's shared network drive, but my colleagues can.",
  },
  {
    title: "Email not syncing",
    description:
      "New emails aren't showing up in my client even though I can see them on my phone.",
  },
  {
    title: "WiFi signal weak in my office",
    description:
      "I have very poor WiFi reception at my desk, but it works fine in other parts of the building.",
  },
];

// Security issue templates
const securityIssues = [
  {
    title: "Suspicious login attempts",
    description:
      "I've received notifications about login attempts from unknown locations.",
  },
  {
    title: "Unable to change password",
    description:
      "The system won't accept my new password even though it meets all the complexity requirements.",
  },
  {
    title: "Need access to restricted area",
    description:
      "I require access to the secure document repository for my new project.",
  },
  {
    title: "Possible phishing email received",
    description:
      "I received an email that looks suspicious and may be attempting to steal credentials.",
  },
  {
    title: "Two-factor authentication not working",
    description:
      "I'm not receiving the verification codes on my phone when trying to log in.",
  },
  {
    title: "Security certificate warning",
    description:
      "I keep getting security warnings when accessing our internal websites.",
  },
];

// Account issue templates
const accountIssues = [
  {
    title: "Account locked out",
    description:
      "I can't log in because my account has been locked due to too many failed attempts.",
  },
  {
    title: "Need email alias created",
    description:
      "I need an additional email alias set up for a new project I'm leading.",
  },
  {
    title: "Missing permissions",
    description:
      "I can't access the financial reporting tool that I need for my job.",
  },
  {
    title: "Name change request",
    description:
      "I recently got married and need my name updated in all systems.",
  },
  {
    title: "Account migration issue",
    description:
      "During the recent system migration, some of my user settings and preferences were lost.",
  },
  {
    title: "Unable to reset security questions",
    description:
      "When trying to update my security questions, the system gives an error.",
  },
];

// Other issue templates
const otherIssues = [
  {
    title: "Office equipment request",
    description:
      "I need a second monitor for my workstation to improve productivity.",
  },
  {
    title: "Software license request",
    description:
      "I need a license for Adobe Photoshop to complete my design work.",
  },
  {
    title: "Training session inquiry",
    description:
      "When is the next training session for the new reporting system?",
  },
  {
    title: "Building access problem",
    description: "My access card isn't working on the main entrance door.",
  },
  {
    title: "Teleconference setup help",
    description:
      "I need assistance setting up the conference room for a virtual meeting tomorrow.",
  },
  {
    title: "Ergonomic assessment request",
    description:
      "I'm experiencing wrist pain and would like an ergonomic assessment of my workspace.",
  },
];

// Combine all issue templates by category
const issueTemplates = {
  Hardware: hardwareIssues,
  Software: softwareIssues,
  Network: networkIssues,
  Security: securityIssues,
  Account: accountIssues,
  Other: otherIssues,
};

// Response templates from IT staff
const adminResponses = [
  "I've taken a look at this issue. Could you please provide more information about when this started happening?",
  "Thanks for reporting this. I've created a case and assigned it to the appropriate team.",
  "I've replicated the issue on my end. We're working on a fix and will update you soon.",
  "This seems to be related to the recent system upgrade. We're investigating the cause.",
  "Have you tried restarting the device? This often resolves the issue.",
  "I'll need to schedule a time to remotely access your computer to diagnose this further.",
  "We've identified the cause of the problem and are working on a solution. We expect it to be resolved within 24 hours.",
  "This issue has been escalated to our senior technical team.",
  "The problem appears to be with the network settings. I'll work with the network team to address this.",
  "Could you please try clearing your browser cache and cookies, then attempt again?",
];

// Internal note templates
const internalNotes = [
  "User has reported this issue multiple times. Need to prioritize.",
  "Checked system logs - no errors found. May need hardware inspection.",
  "Similar issue reported by other users in the same department. Possible wider problem.",
  "User has limited technical knowledge. Will need to provide detailed instructions.",
  "This is a known issue with the latest update. Reference bug #4582.",
  "Assigned to network team for further investigation.",
  "Low priority - workaround is available and has been communicated to user.",
  "Will require on-site visit to resolve.",
  "Parts have been ordered. ETA 3 business days.",
  "Issue appears to be intermittent. Advised user to document when it occurs.",
];

// User response templates
const userResponses = [
  "Thanks for your help. The issue is still happening. Here's some additional information...",
  "I tried what you suggested but it didn't solve the problem.",
  "The problem seems to be getting worse. Can we escalate this?",
  "That fixed it! Thank you so much for your quick assistance.",
  "I'm not available during the time you suggested. Can we reschedule?",
  "I've attached a screenshot showing the error message.",
  "I've noticed this happens only when I'm connected to the VPN.",
  "Could you please explain that in simpler terms? I'm not very technical.",
  "Is there a workaround I can use while you're fixing this?",
  "This is urgent as it's preventing me from completing my project by the deadline.",
];

const seedTickets = async () => {
  try {
    // Clear existing tickets
    await Ticket.deleteMany({});
    console.log("Previous tickets deleted successfully");

    // Get users from database
    const admins = await User.find({ role: "admin" });
    const regularUsers = await User.find({ role: "user" });

    if (admins.length === 0) {
      throw new Error(
        "No admin users found. Please run the main seed script first."
      );
    }

    if (regularUsers.length === 0) {
      throw new Error(
        "No regular users found. Please run the main seed script first."
      );
    }

    console.log(
      `Found ${admins.length} admin users and ${regularUsers.length} regular users`
    );

    // Create tickets array
    const tickets = [];

    for (let i = 0; i < TOTAL_TICKETS; i++) {
      // Pick a random category
      const category = getRandomItem(TICKET_CATEGORIES);

      // Get a random issue template for the selected category
      const issueTemplate = getRandomItem(issueTemplates[category]);

      // Randomize creation date
      const creationDate = getRandomDate(MAX_DAYS_PAST);

      // Determine status (weighted distribution)
      let status;
      if (shouldHappen(TICKETS_SOLVED_PERCENT)) {
        status = "solved";
      } else if (shouldHappen(50)) {
        // Half of non-solved tickets are "in progress"
        status = "in progress";
      } else {
        status = "open";
      }

      // Create the base ticket
      const ticket = {
        title: issueTemplate.title,
        description: issueTemplate.description,
        category: category,
        status: status,
        priority: getRandomItem(TICKET_PRIORITIES),
        user: getRandomItem(regularUsers)._id,
        createdAt: creationDate,
        updatedAt: creationDate,
        responses: [],
      };

      // Assign to admin if applicable (especially for in-progress tickets)
      if (
        status === "in progress" ||
        status === "solved" ||
        shouldHappen(TICKETS_ASSIGNED_PERCENT)
      ) {
        ticket.assignedTo = getRandomItem(admins)._id;
      }

      // Add responses to some tickets
      if (shouldHappen(TICKETS_WITH_RESPONSES_PERCENT)) {
        // Number of responses for this ticket
        const responseCount =
          Math.floor(Math.random() * MAX_RESPONSES_PER_TICKET) + 1;

        // Create response entries
        for (let j = 0; j < responseCount; j++) {
          // Calculate response time (between ticket creation and now)
          const responseDate = new Date(creationDate);
          responseDate.setHours(
            responseDate.getHours() + Math.floor(Math.random() * 72) + 1
          ); // 1-72 hours after ticket or previous response

          if (responseDate > new Date()) {
            // Skip if response date would be in the future
            continue;
          }

          // Alternate between admin and user responses, start with admin for assigned tickets
          const isAdminResponse =
            (j % 2 === 0 && ticket.assignedTo) || shouldHappen(60);

          // Create response object
          const response = {
            text: isAdminResponse
              ? getRandomItem(adminResponses)
              : getRandomItem(userResponses),
            respondedBy: isAdminResponse
              ? ticket.assignedTo || getRandomItem(admins)._id
              : ticket.user,
            isInternal: isAdminResponse && shouldHappen(30), // 30% of admin responses are internal
            createdAt: responseDate,
          };

          // Add internal note if applicable
          if (response.isInternal) {
            response.text = getRandomItem(internalNotes);
          }

          ticket.responses.push(response);

          // Update ticket's updated timestamp to match the latest response
          if (responseDate > ticket.updatedAt) {
            ticket.updatedAt = responseDate;
          }
        }

        // If we have admin responses and the ticket was open, change to in progress
        if (
          ticket.status === "open" &&
          ticket.responses.some((r) =>
            admins.some((a) => a._id.toString() === r.respondedBy.toString())
          )
        ) {
          ticket.status = "in progress";

          // If ticket wasn't assigned, assign it to the first admin who responded
          if (!ticket.assignedTo) {
            const firstAdminResponse = ticket.responses.find((r) =>
              admins.some((a) => a._id.toString() === r.respondedBy.toString())
            );
            if (firstAdminResponse) {
              ticket.assignedTo = firstAdminResponse.respondedBy;
            }
          }
        }
      }

      tickets.push(ticket);

      if ((i + 1) % 10 === 0) {
        console.log(`Generated ${i + 1} of ${TOTAL_TICKETS} tickets...`);
      }
    }

    // Insert all tickets
    await Ticket.insertMany(tickets);
    console.log(`Successfully seeded ${TOTAL_TICKETS} tickets!`);

    // Summary of created data
    const openTickets = tickets.filter((t) => t.status === "open").length;
    const inProgressTickets = tickets.filter(
      (t) => t.status === "in progress"
    ).length;
    const solvedTickets = tickets.filter((t) => t.status === "solved").length;
    const ticketsWithResponses = tickets.filter(
      (t) => t.responses.length > 0
    ).length;
    const assignedTickets = tickets.filter((t) => t.assignedTo).length;

    console.log(`
Data Summary:
------------
Total Tickets: ${TOTAL_TICKETS}
Status Distribution:
  - Open: ${openTickets} (${((openTickets / TOTAL_TICKETS) * 100).toFixed(1)}%)
  - In Progress: ${inProgressTickets} (${(
      (inProgressTickets / TOTAL_TICKETS) *
      100
    ).toFixed(1)}%)
  - Solved: ${solvedTickets} (${((solvedTickets / TOTAL_TICKETS) * 100).toFixed(
      1
    )}%)
Tickets with Responses: ${ticketsWithResponses} (${(
      (ticketsWithResponses / TOTAL_TICKETS) *
      100
    ).toFixed(1)}%)
Assigned Tickets: ${assignedTickets} (${(
      (assignedTickets / TOTAL_TICKETS) *
      100
    ).toFixed(1)}%)
    `);

    mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error seeding tickets:", error);
    process.exit(1);
  }
};

seedTickets();
