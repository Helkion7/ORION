const mongoose = require("mongoose");
const User = require("./models/User");
const Ticket = require("./models/Ticket");
const dotenv = require("dotenv");
const faker = require("faker");

// Load environment variables
dotenv.config();

// Configuration
const TOTAL_TICKETS = 100; // Adjust this number to generate more or fewer tickets
const MAX_RESPONSES_PER_TICKET = 10;
const TICKETS_WITH_RESPONSES_PERCENT = 70; // % of tickets that will have responses
const TICKETS_ASSIGNED_PERCENT = 60; // % of tickets that will be assigned to admins
const TICKETS_SOLVED_PERCENT = 30; // % of tickets that will be in "solved" status

// Max time range for ticket creation (in days)
const MAX_DAYS_PAST = 365; // Tickets will be created between now and this many days ago

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

// Staff roles
const STAFF_ROLES = ["admin", "firstLineSupport", "secondLineSupport"];

// Hardware issue templates with more descriptive content
const hardwareIssues = [
  {
    title: "Computer won't turn on",
    description:
      "When I press the power button, my computer doesn't start up. The power light doesn't come on, and I don't hear any fans spinning. I've checked that it's properly plugged in and tried a different power outlet with no success. This started happening yesterday after a brief power outage in our building.",
  },
  {
    title: "Monitor displaying distorted colors",
    description:
      "My monitor is showing strange colors - everything has a greenish tint, and some areas are displaying incorrectly. I've already tried adjusting the monitor settings but the issue persists. The monitor is about 3 years old and was working perfectly until this morning.",
  },
  {
    title: "Printer not working",
    description:
      "My HP LaserJet printer isn't printing any documents. When I try to print, it shows a paper jam error, but I've checked thoroughly and there's no paper jam. I've tried turning it off and on, disconnecting and reconnecting the USB cable, and reinstalling the drivers with no success.",
  },
  {
    title: "Computer running extremely slowly",
    description:
      "My workstation has become incredibly slow over the past week. Simple tasks like opening Word documents or browsing the internet take minutes instead of seconds. The computer is about 2 years old and has an Intel i5 processor with 8GB RAM. I haven't installed any new software recently.",
  },
  {
    title: "Keyboard keys not responding",
    description:
      "Several keys on my keyboard (specifically W, E, R, and T) have stopped working. I've cleaned under the keys but they still aren't responding. This is severely limiting my ability to type efficiently and complete my work. Could I get a replacement keyboard?",
  },
  {
    title: "Battery not charging",
    description:
      "My laptop battery isn't charging anymore. When I plug in the power adapter, the charging light doesn't come on, and the battery percentage continues to decrease. I've tried using a different power outlet and checking the adapter connection, but the issue persists.",
  },
];

// Software issue templates with more realistic problems
const softwareIssues = [
  {
    title: "Unable to install required software",
    description:
      "I need to install the latest version of Adobe Creative Suite for a project, but I keep getting error code 0x80070643 during installation. I've tried running the installer as administrator and disabling my antivirus temporarily, but I still get the same error. This is blocking my progress on an urgent project due next week.",
  },
  {
    title: "Excel crashes when opening large files",
    description:
      "Microsoft Excel keeps crashing whenever I try to open spreadsheets larger than 5MB. I work with financial data that often exceeds this size. The application freezes for about 30 seconds and then closes without any error message. I've already tried repairing the Office installation through Control Panel.",
  },
  {
    title: "Email attachments not downloading",
    description:
      "I can't download attachments from emails in Outlook. When I click on an attachment, nothing happens - no error message, no download dialog. This is happening with all types of attachments (PDF, Word docs, images). I've checked my download folder and nothing appears there either.",
  },
  {
    title: "Windows Update failing",
    description:
      "Windows Update is failing to install updates with error code 0x8024400A. I've tried the Windows Update Troubleshooter and clearing the update cache using the official Microsoft guidelines, but the same error keeps appearing. My system might have security vulnerabilities without these updates.",
  },
  {
    title: "Application compatibility issue after upgrade",
    description:
      "After upgrading to Windows 11, our proprietary accounting software doesn't work correctly. It shows strange UI glitches and crashes when trying to generate reports. The software vendor says they don't officially support Windows 11 yet, but I need this working for month-end closing next week.",
  },
  {
    title: "Need software installed that requires admin rights",
    description:
      "I need to install statistical analysis software (SPSS) for a research project, but it requires administrator privileges which I don't have on my work computer. The software is approved by our department and I have a valid license, but I need IT assistance to complete the installation.",
  },
];

// Network issue templates with technical details
const networkIssues = [
  {
    title: "Cannot connect to company VPN",
    description:
      "I'm unable to connect to the company VPN from home. When I try to connect using the GlobalProtect client, it gets stuck on 'Connecting...' for several minutes and then times out with error 'Failed to establish connection to server'. I need urgent access to work files that are only available on the internal network.",
  },
  {
    title: "Intermittent connection drops in meeting room B",
    description:
      "When working in meeting room B, my laptop repeatedly loses connection to the WiFi network (ORION-CORP). This happens approximately every 10-15 minutes and lasts for about 30 seconds each time. This is disrupting video meetings and causing problems for everyone using this room.",
  },
  {
    title: "Extremely slow file transfer speeds",
    description:
      "Transferring files to and from the network drive is extremely slow (less than 1MB/s when it should be at least 10MB/s). This is making it difficult to work with large design files that need to be accessed from the shared project folder. Other network operations like browsing the internet seem normal.",
  },
  {
    title: "Unable to connect to printer over network",
    description:
      "I can't connect to the network printer (HP LaserJet 4350 in the Marketing department). My computer can see the printer in the network devices list, but when I try to print, I get an error saying 'Cannot connect to printer'. Other people in my department can print to it without issues.",
  },
  {
    title: "Can't access specific websites",
    description:
      "I'm unable to access several websites needed for my research, including scholar.google.com and researchgate.net. Other websites load normally. When trying to access these sites, the browser just shows 'This site can't be reached'. Are these being blocked by the company firewall?",
  },
  {
    title: "WiFi connectivity issues with company laptop",
    description:
      "My computer says it's connected to WiFi but I can't access any websites. The WiFi icon shows full signal strength, but browsers and other internet-dependent applications can't connect. I've tried restarting my computer and reconnecting to the network multiple times.",
  },
];

// Security issues with more detailed descriptions
const securityIssues = [
  {
    title: "Suspicious login attempts detected",
    description:
      "I've received multiple email alerts about unsuccessful login attempts to my company account from an IP address in Eastern Europe. I've changed my password immediately, but I'm concerned about these repeated attempts. Could someone from IT security review these alerts and advise if further action is needed?",
    priority: "high",
  },
  {
    title: "Potential phishing email received",
    description:
      "I received an email claiming to be from our CEO asking for urgent wire transfer details. The email address looks slightly off (ceo.orion@gmail.com instead of our company domain), and the tone doesn't match his usual communication style. I've not responded, but I wanted to report this as it might be targeting other employees too.",
    priority: "high",
  },
  {
    title: "Antivirus software constantly showing alerts",
    description:
      "My computer's antivirus software (McAfee) has been showing frequent alerts about blocked threats over the past two days, usually when browsing work-related websites. I haven't clicked on any suspicious links or downloaded unusual files. Is this a false positive or should I be concerned?",
  },
  {
    title: "Lost company phone with sensitive information",
    description:
      "I misplaced my company-issued iPhone yesterday evening, possibly in a taxi. It has my work email and access to several company applications. I've tried calling the phone but it goes straight to voicemail. Can you help me remotely wipe the device and issue a replacement?",
    priority: "urgent",
  },
  {
    title: "Need help setting up multi-factor authentication",
    description:
      "According to the recent security policy update, I need to set up multi-factor authentication for my account by Friday. I've tried following the instructions in the email, but I'm encountering difficulties at the verification step. Could someone walk me through this process?",
  },
  {
    title: "Unauthorized software installation detected",
    description:
      "I received an alert from IT security about unauthorized software on my computer, but I don't recall installing anything unusual. The notification mentioned something about a 'browser extension' being detected. I want to resolve this as quickly as possible.",
  },
];

// Account issue templates with user-specific problems
const accountIssues = [
  {
    title: "Account locked after password attempts",
    description:
      "My account has been locked after multiple failed login attempts this morning. I may have mistyped my password a few times, but now I can't access any company systems even with the correct password. I need this resolved urgently as I have deliverables due today.",
    priority: "high",
  },
  {
    title: "Need permissions for project folder",
    description:
      "I've been assigned to the Phoenix Marketing Project, but I don't have access to the shared project folder at \\\\server\\projects\\phoenix. Could you please grant me read/write permissions? My manager Jacob Peterson has approved this request.",
  },
  {
    title: "Email alias setup request",
    description:
      "I need an additional email alias set up for a new project I'm leading. The alias should be phoenix.project@orion.com and should forward to my regular email address. This was approved by Department Head Sarah Johnson and will be used for client communications on the Phoenix project.",
  },
  {
    title: "Name change in company directory",
    description:
      "I recently got married and need my name updated in all company systems. My previous name was Jane Smith, and my new legal name is Jane Rodriguez. I've already updated my HR records, but my email, directory listing, and other systems still show my old name.",
  },
  {
    title: "Need temporary access for contractor",
    description:
      "We have a web developer contractor (Michael Chen, m.chen@webdevpros.com) starting next Monday who will need access to our WordPress environment and design asset library for 6 weeks. Could you please create a temporary account with appropriate permissions? This has been approved by Lisa Wong in Procurement.",
  },
  {
    title: "Password reset not sending verification email",
    description:
      "I tried to reset my password using the self-service portal, but I'm not receiving the verification email that should be sent to my personal email address (registered as backup). I've checked my spam folder and waited over an hour. I need access to complete an urgent client presentation.",
    priority: "high",
  },
];

// Other miscellaneous issue templates
const otherIssues = [
  {
    title: "Request for dual monitors",
    description:
      "I'd like to request a second monitor for my workstation to improve productivity when working with multiple applications. My role in data analysis often requires comparing spreadsheets and reports side by side. My manager David Torres has approved this request.",
  },
  {
    title: "Conference room AV setup assistance",
    description:
      "We're hosting an important client presentation in Conference Room A tomorrow at 10 AM and need help ensuring the audiovisual equipment is working properly. Specifically, we need to connect a MacBook Pro to the projector and ensure the sound works through the room speakers. Could someone from IT be available at 9:30 AM to assist?",
    priority: "high",
  },
  {
    title: "Mobile app testing device request",
    description:
      "Our development team needs an Android device with Android 11 or newer for testing our company's mobile app before release. We currently only have access to older devices running Android 9. Could IT provide a newer test device or approve purchase of one? Budget code for this project is DEV-2023-142.",
  },
  {
    title: "Request for specialized software training",
    description:
      "I recently started using Tableau for data visualization as part of my role, but I'm struggling with creating advanced dashboards. Does IT offer any training resources or could you recommend external training options that the company might approve?",
  },
  {
    title: "Office relocation tech support",
    description:
      "I'm moving to a different desk (from 4th floor, desk 4B to 3rd floor, desk 12C) next Monday as part of department reorganization. I'll need help disconnecting and reconnecting my equipment, ensuring network connectivity, and setting up my phone extension at the new location.",
  },
  {
    title: "Headset recommendation for video calls",
    description:
      "With the increase in remote meetings, I need a good quality headset compatible with our video conferencing software. Could you recommend a company-approved headset that works well with Microsoft Teams and has good noise cancellation? Is there a procurement process for this?",
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

// Response templates from IT staff - enhanced with more professional content
const adminResponses = [
  "I've taken a look at this issue and created ticket #REF-2023-{ticketId}. Could you please provide more information about when this problem first started occurring and any error messages you're seeing?",

  "Thank you for reporting this issue. I've assigned it to our specialized team that handles these matters. You should receive a follow-up response by the end of the day.",

  "I've replicated the issue on our test environment and identified the likely cause. I'll be applying a fix remotely to your system within the next hour. Please save any open work as your computer may need to restart during this process.",

  "Based on your description, this appears to be related to a known issue affecting several users. Our team is working on a permanent fix, but in the meantime, you can use this workaround: [detailed steps provided]",

  "I'll need to schedule a remote session to investigate this further. Are you available tomorrow between 10 AM and 12 PM? Please confirm a time that works for you.",

  "We've deployed a fix to your system. Please test the functionality again and let us know if you're still experiencing issues. If everything is working correctly, we'll close this ticket in 24 hours.",

  "This issue requires a hardware replacement. I've put in an order for the necessary parts (reference #HW-23789), which should arrive within 2-3 business days. We'll contact you to arrange installation once they arrive.",

  "I've escalated this to our Level 2 support team as it requires specialized knowledge. The new ticket reference is L2-2023-{ticketId}, and you'll be contacted by a senior technician within 4 hours.",

  "We need to update your system to the latest version to resolve this issue. This will require approximately 30 minutes of downtime. Would you prefer we do this during lunch hours or at the end of your workday?",

  "I've added the requested permissions to your account. Please allow up to 15 minutes for the changes to propagate through the system, then try accessing the resource again.",
];

// Internal notes for admin communication
const internalNotes = [
  "This is a recurring issue for this department. Recommend scheduling a full system audit next month. Contact manager to coordinate.",

  "User has reported similar issues 3 times in the past month. Hardware is approaching end-of-life and should be scheduled for replacement in the next refresh cycle. Added to the replacement list for Q4.",

  "Checked system logs and found evidence of resource contention. The user's workstation has insufficient RAM for the applications they're running. Recommending upgrade from 8GB to 16GB.",

  "This is a known issue with the latest Windows security patch (KB5005565). Microsoft has acknowledged the bug and is working on a fix expected in next month's update. Added to our tracking system.",

  "The problem appears to be network-related rather than application-specific. Notified network team to investigate potential issues with the switch in Building B, 3rd floor.",

  "User has administrative privileges that they shouldn't have according to our security policy. Need to review and adjust permissions without disrupting their workflow. Consulting with their manager first.",

  "This issue affects multiple users in the Marketing department. Creating a broader investigation and will develop a department-wide solution rather than handling individually.",

  "Password reset requests from this user have been unusually frequent (4 in past month). May need security awareness training - flagging for next session.",

  "Hardware diagnostic tests indicate the storage drive is beginning to fail (multiple bad sectors detected). Need to schedule data backup and drive replacement before complete failure.",

  "This is a licensing issue - we've reached our limit for concurrent users on this software. Procurement has been notified to purchase additional licenses. ETA for resolution is 5 business days.",
];

// User response templates with more varied and realistic content
const userResponses = [
  "Thank you for looking into this. I've noticed that the issue happens most frequently in the afternoons, usually after I've been using the application for a few hours. There's no specific error message, just the behavior I described.",

  'I tried the solution you suggested but unfortunately the problem is still occurring. The specific error message is: "Error code: 0x80074D06 - Network connectivity issues detected."',

  "The workaround is helping for now, thank you! However, I'm concerned that this is just a temporary fix. When do you think a permanent solution will be available?",

  "I'll be available for a remote session tomorrow at 10:30 AM. Should I expect a call or will you send a meeting invitation with connection details?",

  "I've attached a screenshot showing exactly what happens when the error occurs. You can see the dialog box that appears and the unusual behavior in the background application.",

  "The issue seems to be getting worse. Now I can't access any of my files, and my deadline is tomorrow morning. Is there any way to expedite this?",

  "Thank you for resolving this so quickly! Everything is working perfectly now. I really appreciate your help with this urgent matter.",

  "I'm having trouble following the instructions in step 3. When I click on 'Network Settings' as suggested, I don't see the option for 'Advanced Configuration' that you mentioned.",

  "I've noticed that the problem only occurs when I'm connected to the VPN. If I disconnect from VPN, everything works normally, but I need VPN access for my work.",

  "This is a critical issue affecting our entire team. We have a client presentation in two days and can't prepare without access to these files. Please prioritize this if possible.",
];

// Additional detailed user notes for ticket context
const additionalNotes = [
  "This issue is preventing me from completing a critical project due by the end of this week. Any expedited assistance would be greatly appreciated.",

  "I've already tried rebooting my computer, clearing browser cache, and disabling extensions as suggested in the IT self-help guide.",

  "This is the third time this month I've experienced this problem. Previous ticket references: #45892 and #46013.",

  "My colleagues on the same team are experiencing identical issues, so this might be affecting our entire department.",

  "This is urgent as it's preventing me from completing my project by the deadline.",
];

const seedTickets = async () => {
  try {
    // Clear existing tickets
    await Ticket.deleteMany({});
    console.log("Previous tickets deleted successfully");

    // Get users from database
    const admins = await User.find({ role: { $in: STAFF_ROLES } });
    const regularUsers = await User.find({ role: "user" });

    if (admins.length === 0) {
      throw new Error(
        "No admin/support users found. Please run the main seed script first."
      );
    }

    if (regularUsers.length === 0) {
      throw new Error(
        "No regular users found. Please run the main seed script first."
      );
    }

    console.log(
      `Found ${admins.length} support staff users and ${regularUsers.length} regular users`
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

      // Set priority - make security and account issues more likely to be high/urgent
      let priority;
      if (category === "Security" || category === "Account") {
        // Higher chance of important priority for security/account issues
        priority = shouldHappen(60)
          ? getRandomItem(["high", "urgent"])
          : getRandomItem(["low", "medium"]);
      } else {
        // Normal distribution for other categories
        priority = getRandomItem(TICKET_PRIORITIES);
      }

      // Allow override if the template specifies a priority
      if (issueTemplate.priority) {
        priority = issueTemplate.priority;
      }

      // Add a random note to some ticket descriptions for more variety
      const description = shouldHappen(30)
        ? `${issueTemplate.description}\n\n${getRandomItem(additionalNotes)}`
        : issueTemplate.description;

      // Create the base ticket
      const ticket = {
        title: issueTemplate.title,
        description: description,
        category: category,
        status: status,
        priority: priority,
        user: getRandomItem(regularUsers)._id,
        createdAt: creationDate,
        updatedAt: creationDate,
        responses: [],
      };

      // Assign to support staff if applicable
      if (
        status === "in progress" ||
        status === "solved" ||
        shouldHappen(TICKETS_ASSIGNED_PERCENT)
      ) {
        // Assign to appropriate support staff based on priority and category
        if (
          priority === "urgent" ||
          priority === "high" ||
          category === "Security"
        ) {
          // Assign higher priority/security issues to admins more often
          const adminUsers = admins.filter((admin) => admin.role === "admin");
          ticket.assignedTo =
            adminUsers.length > 0
              ? getRandomItem(adminUsers)._id
              : getRandomItem(admins)._id;
        } else {
          // Distribute other tickets among all support staff
          ticket.assignedTo = getRandomItem(admins)._id;
        }
      }

      // Add responses to some tickets
      if (shouldHappen(TICKETS_WITH_RESPONSES_PERCENT)) {
        // Number of responses for this ticket - more responses for older tickets
        const daysSinceCreation =
          (new Date() - creationDate) / (1000 * 60 * 60 * 24);
        const maxResponses = Math.min(
          MAX_RESPONSES_PER_TICKET,
          Math.ceil(daysSinceCreation / 7) + 1
        );
        const responseCount = Math.floor(Math.random() * maxResponses) + 1;

        // Create response entries
        for (let j = 0; j < responseCount; j++) {
          // Calculate response time (between ticket creation and now)
          const responseDate = new Date(creationDate);
          const hoursToAdd = Math.floor(Math.random() * 72) + j * 24 + 1; // Space out responses more realistically
          responseDate.setHours(responseDate.getHours() + hoursToAdd);

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
              ? getRandomItem(adminResponses).replace(
                  "{ticketId}",
                  ticket._id ? ticket._id.toString().slice(-5) : "xxxxx"
                )
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

        // Update status based on responses
        if (ticket.responses.length > 0) {
          if (ticket.status === "solved") {
            // No change needed - ticket is already solved
          } else if (ticket.responses.some((r) => r.isInternal)) {
            // If there are internal notes, ticket is likely being worked on
            ticket.status = "in progress";
          } else if (ticket.responses.length >= 2 && shouldHappen(50)) {
            // Some tickets with multiple responses are solved
            ticket.status = shouldHappen(40) ? "solved" : "in progress";
          } else if (
            ticket.status === "open" &&
            ticket.responses.some((r) =>
              admins.some((a) => a._id.toString() === r.respondedBy.toString())
            )
          ) {
            // If an admin has responded, likely the ticket is in progress
            ticket.status = "in progress";
          }
        }

        // If ticket wasn't assigned but has admin responses, assign it to the first admin who responded
        if (!ticket.assignedTo) {
          const firstAdminResponse = ticket.responses.find((r) =>
            admins.some((a) => a._id.toString() === r.respondedBy.toString())
          );
          if (firstAdminResponse) {
            ticket.assignedTo = firstAdminResponse.respondedBy;
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

    // Count by priority
    const urgentTickets = tickets.filter((t) => t.priority === "urgent").length;
    const highTickets = tickets.filter((t) => t.priority === "high").length;
    const mediumTickets = tickets.filter((t) => t.priority === "medium").length;
    const lowTickets = tickets.filter((t) => t.priority === "low").length;

    // Count by category
    const categoryCounts = {};
    TICKET_CATEGORIES.forEach((category) => {
      categoryCounts[category] = tickets.filter(
        (t) => t.category === category
      ).length;
    });

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

Priority Distribution:
  - Urgent: ${urgentTickets} (${((urgentTickets / TOTAL_TICKETS) * 100).toFixed(
      1
    )}%)
  - High: ${highTickets} (${((highTickets / TOTAL_TICKETS) * 100).toFixed(1)}%)
  - Medium: ${mediumTickets} (${((mediumTickets / TOTAL_TICKETS) * 100).toFixed(
      1
    )}%)
  - Low: ${lowTickets} (${((lowTickets / TOTAL_TICKETS) * 100).toFixed(1)}%)

Category Distribution:
${Object.entries(categoryCounts)
  .map(
    ([category, count]) =>
      `  - ${category}: ${count} (${((count / TOTAL_TICKETS) * 100).toFixed(
        1
      )}%)`
  )
  .join("\n")}

Ticket Details:
  - With Responses: ${ticketsWithResponses} (${(
      (ticketsWithResponses / TOTAL_TICKETS) *
      100
    ).toFixed(1)}%)
  - Assigned: ${assignedTickets} (${(
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
