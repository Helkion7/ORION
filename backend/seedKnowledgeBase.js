const mongoose = require("mongoose");
const KnowledgeBase = require("./models/KnowledgeBase");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected for knowledge base seeding"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

// Knowledge base entries by category
const knowledgeBaseEntries = [
  // Hardware Category
  {
    title: "Computer Won't Turn On - Troubleshooting Guide",
    summary:
      "Step-by-step guide to diagnose and fix a computer that won't power on",
    content: `# Computer Won't Turn On - Troubleshooting Guide

## Initial Checks
1. Verify the power cord is securely connected to both the computer and wall outlet
2. Try a different power outlet to rule out electrical issues
3. Check if the power supply switch on the back of the computer is turned on (I/O switch, where I is on)
4. Listen for fans or lights when you press the power button

## Power Supply Tests
1. Check for lights on the motherboard - even a small LED indicates power is reaching the system
2. Try the paperclip test on the power supply (CAUTION: Only if you're trained to do so)
3. If available, use a PSU tester to verify the power supply is functioning

## Component Issues
1. Disconnect all non-essential components (external drives, USB devices)
2. Remove and reseat the RAM
3. Disconnect internal components one by one to isolate the issue
4. Clear CMOS by removing the motherboard battery for 30 seconds (computer unplugged)

## Advanced Troubleshooting
1. Test with a known-working power supply if available
2. Check for physical damage to the motherboard
3. Inspect capacitors for bulging or leaking
4. Test essential components in another system if possible

## When to Escalate
If none of the above steps resolve the issue, the system likely needs professional diagnosis or component replacement.`,
    category: "Hardware",
    tags: [
      "power",
      "boot",
      "troubleshooting",
      "hardware failure",
      "power supply",
      "motherboard",
      "startup issue",
    ],
  },
  {
    title: "Printer Connection Troubleshooting",
    summary: "How to resolve common printer connection issues",
    content: `# Printer Connection Troubleshooting

## Network Printer Issues
1. Verify the printer is powered on and connected to the network
2. Check if the printer has a valid IP address (print a configuration page from the printer)
3. Ensure the computer and printer are on the same network
4. Try accessing the printer's web interface by entering its IP address in a browser
5. Restart both the printer and the router/switch it connects to

## USB Connected Printer
1. Try a different USB cable and/or port
2. Uninstall and reinstall the printer drivers
3. Check Device Manager for any errors or unknown devices
4. Ensure the printer is not in an error state (paper jam, out of ink, etc.)

## Driver Issues
1. Download the latest drivers from the manufacturer's website
2. Uninstall existing drivers completely before installing new ones
3. For Windows, try using the generic/universal print driver as a temporary solution
4. Check if the printer works in Safe Mode

## Print Spooler Fixes
1. Restart the Print Spooler service:
   - Open Services (services.msc)
   - Find "Print Spooler"
   - Right-click and select Restart
2. Clear the print queue:
   - Stop the Print Spooler service
   - Navigate to C:\\Windows\\System32\\spool\\PRINTERS and delete all files
   - Restart the Print Spooler service

## Common Manufacturer-Specific Issues
- HP: Use HP Print and Scan Doctor tool
- Epson: Check ink cartridge sensors and alignment
- Brother: Verify network settings match the router's configuration
- Canon: Check for firmware updates for the printer

If these steps don't resolve the issue, contact the printer manufacturer's support.`,
    category: "Hardware",
    tags: [
      "printer",
      "connectivity",
      "driver",
      "USB",
      "network printer",
      "troubleshooting",
      "print spooler",
    ],
  },

  // Software Category
  {
    title: "Windows Blue Screen (BSOD) Troubleshooting",
    summary: "How to diagnose and fix Blue Screen of Death errors in Windows",
    content: `# Windows Blue Screen (BSOD) Solutions

## Understanding the Error
1. Note the error code displayed on the blue screen (e.g., MEMORY_MANAGEMENT, IRQL_NOT_LESS_OR_EQUAL)
2. Look for patterns - does it happen during specific activities or at random?
3. Check Windows reliability history for additional information

## Immediate Fixes
1. Restart your computer - some BSODs are one-time occurrences
2. Boot into Safe Mode (press F8 during startup or through Advanced Startup options)
3. Undo recent changes:
   - Uninstall recently added software
   - Remove newly installed hardware
   - Roll back device drivers to previous versions

## Driver Issues
1. Update drivers, especially graphics, network, and storage controllers
2. Check Device Manager for devices with warning icons
3. For driver-specific BSODs, use the error code to identify the problematic driver
4. Use Driver Verifier to test drivers (advanced users only)

## Hardware Diagnostics
1. Run Windows Memory Diagnostic (search "Windows Memory Diagnostic" in Start menu)
2. Check disk health with CHKDSK (Command Prompt: chkdsk /f /r)
3. Monitor temperatures to rule out overheating
4. Test components with diagnostic tools (MemTest86 for RAM, etc.)

## System File Repairs
1. Run System File Checker (Command Prompt as admin: sfc /scannow)
2. Use DISM to repair Windows image:
   - DISM /Online /Cleanup-Image /RestoreHealth
3. Reset or repair Windows installation if issues persist

## Advanced Troubleshooting
1. Analyze memory dump files using Windows Debugging Tools
2. Look for patterns in Event Viewer > Windows Logs > System
3. Test with minimal hardware configuration
4. Update BIOS/UEFI firmware

If BSODs continue after these steps, consider a clean Windows installation or professional hardware diagnosis.`,
    category: "Software",
    tags: [
      "BSOD",
      "blue screen",
      "crash",
      "windows",
      "troubleshooting",
      "drivers",
      "system error",
      "memory dump",
    ],
  },
  {
    title: "Software Installation Best Practices",
    summary: "Guidelines for safely and effectively installing software",
    content: `# Software Installation Best Practices

## Before Installation
1. Verify system requirements match your computer specifications
2. Back up important data before major software installations
3. Download software only from official sources or trusted repositories
4. Scan installation files with antivirus software
5. Close other applications, especially those that might interfere

## During Installation
1. Read each step of the installation process carefully
2. Use custom installation options to:
   - Choose installation location
   - Prevent unwanted bundled software (uncheck optional offers)
   - Configure appropriate settings
3. For business software, consider impact on other applications and services
4. Note any special instructions or post-installation steps

## After Installation
1. Update the software to the latest version immediately
2. Configure security settings appropriately
3. Create a restore point after successful installation
4. Test basic functionality to ensure proper installation
5. Document license keys, installation paths, and configuration settings

## Business Environment Considerations
1. Follow change management procedures
2. Test in a non-production environment first
3. Schedule installations during off-hours for critical systems
4. Prepare rollback procedures in case of issues
5. Update software inventory documentation

## Troubleshooting Failed Installations
1. Check logs for error messages (often in %temp% folder)
2. Verify sufficient disk space and permissions
3. Disable antivirus temporarily if it's interfering
4. Run installer as administrator
5. Use clean boot to avoid service conflicts

## Uninstalling Software
1. Always use the official uninstaller when available
2. For Windows, use Programs and Features in Control Panel
3. Consider third-party uninstallers for thorough removal
4. Check for and delete leftover files after uninstallation
5. Clean registry entries if necessary (with caution)`,
    category: "Software",
    tags: [
      "installation",
      "software",
      "best practices",
      "setup",
      "configuration",
      "uninstall",
      "applications",
    ],
  },

  // Network Category
  {
    title: "Wi-Fi Connectivity Troubleshooting",
    summary: "How to diagnose and resolve wireless network connection problems",
    content: `# Wi-Fi Connectivity Troubleshooting

## Basic Connectivity Checks
1. Verify Wi-Fi is enabled (check physical switch/button on laptop)
2. Confirm the correct network is selected
3. Check signal strength indicator (at least 2-3 bars)
4. Forget the network and reconnect with fresh credentials
5. Restart the device having connectivity issues

## Router/Access Point Troubleshooting
1. Restart the router (unplug for 30 seconds, then reconnect)
2. Check router status lights for abnormalities
3. Ensure router firmware is updated to the latest version
4. Verify other devices can connect to the network
5. Check for interference sources (other electronics, neighboring networks)

## Wi-Fi Signal Issues
1. Move closer to the router/access point
2. Remove physical obstructions (walls, large objects)
3. Change router channel to avoid interference (access router settings)
4. Switch between 2.4GHz and 5GHz bands if available
5. Consider adding a Wi-Fi extender for better coverage

## Connection Dropping Issues
1. Update wireless adapter drivers
2. Adjust power management settings:
   - Device Manager > Network adapters > Wi-Fi adapter > Properties
   - Power Management > Uncheck "Allow the computer to turn off this device to save power"
3. Disable power saving mode for Wi-Fi adapter
4. Set a static IP address instead of using DHCP

## Authentication Problems
1. Reset network credentials and reconnect
2. Check for MAC address filtering on the router
3. Verify security type matches (WPA2, WPA3, etc.)
4. Try connecting with a different device to isolate the issue

## Advanced Diagnostics
1. Run Windows network troubleshooter
2. Use Command Prompt commands:
   - ipconfig /all (verify IP configuration)
   - ipconfig /release followed by ipconfig /renew
   - ipconfig /flushdns to clear DNS cache
3. Test with ping commands:
   - ping 127.0.0.1 (loopback test)
   - ping [router IP] (typically 192.168.1.1)
   - ping 8.8.8.8 (external connectivity)
   - ping google.com (DNS resolution)

## Business Environment Solutions
1. Check for certificate issues with enterprise Wi-Fi
2. Verify proper configuration of 802.1x authentication
3. Ensure user has proper network access rights
4. Contact network administrator for specific access point issues`,
    category: "Network",
    tags: [
      "Wi-Fi",
      "wireless",
      "connectivity",
      "router",
      "network",
      "signal strength",
      "internet",
      "connection dropping",
    ],
  },
  {
    title: "VPN Connection Troubleshooting",
    summary: "Solutions for common VPN connection issues",
    content: `# VPN Connection Troubleshooting

## Basic Connection Issues
1. Verify internet connectivity before attempting VPN connection
2. Check VPN credentials are entered correctly
3. Ensure the VPN service is running on your device
4. Try connecting to a different VPN server if available
5. Verify your subscription/license is active

## Common Error Solutions
1. Connection timeout:
   - Check firewall settings
   - Try a different network connection
   - Verify server address is correct
2. Authentication failure:
   - Reset password or request new credentials
   - Check if account is locked out
   - Verify username format (some require domain\\username)
3. TLS/SSL errors:
   - Update VPN client software
   - Verify system date and time are correct
   - Check for certificate issues

## Network Configuration Problems
1. Ensure required ports are open (common VPN ports: 1194, 443, 500, 4500)
2. Check if your network blocks VPN protocols (OpenVPN, L2TP, IPSec)
3. Try changing VPN protocol if your client allows it
4. Disable IPv6 temporarily to test if it resolves the issue
5. Verify DNS settings after connection is established

## Split Tunneling Issues
1. Review split tunneling configuration
2. Check route table after connection (Command Prompt: route print)
3. Verify internal resources are accessible through VPN
4. Test with split tunneling disabled

## Performance Problems
1. Choose a server geographically closer to your location
2. Switch to a less congested server
3. Try a different VPN protocol (OpenVPN TCP vs UDP)
4. Lower encryption level if security requirements allow
5. Close bandwidth-intensive applications

## Mobile Device Specific Issues
1. Disable battery optimization for the VPN app
2. Check for OS restrictions on VPN functionality
3. Verify VPN app has necessary permissions
4. Try Wi-Fi instead of cellular data or vice versa

## Corporate VPN Specific Troubleshooting
1. Ensure client software matches the corporate VPN solution
2. Verify you have the correct connection profile installed
3. Check for required security software (endpoint protection)
4. Contact IT helpdesk for specific configuration requirements`,
    category: "Network",
    tags: [
      "VPN",
      "remote access",
      "connection",
      "tunneling",
      "security",
      "authentication",
      "corporate network",
    ],
  },

  // Security Category
  {
    title: "Password Security Best Practices",
    summary: "Guidelines for creating and managing secure passwords",
    content: `# Password Security Best Practices

## Creating Strong Passwords
1. Use at least 12 characters - longer is stronger
2. Combine uppercase letters, lowercase letters, numbers, and special characters
3. Avoid dictionary words, names, and common phrases
4. Don't use personal information like birthdays or pet names
5. Create unique passwords for each account - never reuse passwords

## Password Management
1. Use a reputable password manager to store and generate passwords
2. Enable two-factor authentication (2FA) wherever available
3. Change passwords immediately if a service reports a data breach
4. Regularly update critical passwords (financial accounts, email)
5. Consider using passphrase (multiple random words) for better memorability and security

## Company Password Policies
1. Implement password expiration only when there's evidence of compromise
2. Enforce minimum length and complexity requirements
3. Check new passwords against known breached password databases
4. Avoid requiring frequent changes as this leads to predictable patterns
5. Use contextual authentication (checking location, device, time) alongside passwords

## Secure Password Recovery
1. Use unique and hard-to-guess security questions
2. Ensure recovery email accounts are secure
3. Be cautious of password reset emails - verify they're legitimate
4. For critical accounts, set up backup methods (recovery codes, backup email)
5. Document recovery procedures for critical business accounts

## Password Alternatives
1. Consider biometric authentication where appropriate (fingerprint, face recognition)
2. Use hardware security keys for critical accounts
3. Implement single sign-on (SSO) solutions for enterprise environments
4. Explore passwordless authentication options (magic links, authenticator apps)
5. Evaluate adaptive authentication based on risk factors

## Recognizing Password Threats
1. Be alert to phishing attempts requesting password information
2. Never share passwords via email or unencrypted communications
3. Check URLs carefully before entering credentials
4. Be wary of shoulder surfing in public places
5. Watch for signs of credential stuffing attacks (unusual login notifications)`,
    category: "Security",
    tags: [
      "passwords",
      "security",
      "authentication",
      "2FA",
      "password manager",
      "data breach",
      "password policy",
    ],
  },
  {
    title: "Identifying and Responding to Phishing Attacks",
    summary: "How to recognize and handle phishing attempts",
    content: `# Identifying and Responding to Phishing Attacks

## Common Phishing Red Flags
1. Urgent requests requiring immediate action
2. Emails claiming account problems or security issues
3. Suspicious or mismatched sender addresses (check carefully)
4. Generic greetings rather than your name ("Dear Customer")
5. Poor grammar, spelling errors, or unusual formatting
6. Offers that seem too good to be true
7. Unexpected attachments or links

## Link and URL Safety
1. Hover over links to preview destination URLs before clicking
2. Check if URLs use HTTPS (secure) connections
3. Be suspicious of URL shorteners in professional communications
4. Look for typosquatting domains (e.g., "micros0ft.com" instead of "microsoft.com")
5. When in doubt, access websites directly through your browser, not email links

## Email Attachment Safety
1. Never open attachments you weren't expecting
2. Be especially cautious of .zip, .exe, .scr and macro-enabled Office files
3. Verify with the sender through a different channel before opening suspicious attachments
4. Use antivirus software to scan attachments before opening
5. Be skeptical of password-protected archives in unexpected emails

## How to Respond to Suspected Phishing
1. Don't click links, open attachments, or reply to the sender
2. Report the email to your IT department or security team
3. Mark the email as spam/phishing in your email client
4. Delete the email after reporting
5. If you've already clicked or responded, change affected passwords immediately

## Business Email Compromise (BEC)
1. Be extra cautious with emails requesting fund transfers or payment changes
2. Verify requests for sensitive information or money via phone or in person
3. Check email headers for signs of spoofing
4. Be alert to changes in tone, language, or communication patterns
5. Implement multi-person authorization for financial transactions

## Protecting Your Organization
1. Use email filtering solutions with anti-phishing capabilities
2. Conduct regular security awareness training for all employees
3. Implement DMARC, SPF, and DKIM email authentication protocols
4. Consider deploying additional technical controls like link inspection
5. Establish and communicate clear incident response procedures`,
    category: "Security",
    tags: [
      "phishing",
      "email security",
      "social engineering",
      "cyber attacks",
      "scam",
      "security awareness",
      "fraud",
    ],
  },

  // Account Category
  {
    title: "Account Lockout Resolution",
    summary: "Steps to resolve account lockouts and prevent future occurrences",
    content: `# Account Lockout Resolution

## Immediate Resolution Steps
1. Wait for the automatic lockout period to expire (typically 15-30 minutes)
2. Use self-service password reset if available
3. Contact the IT help desk with your employee ID or username ready
4. Be prepared to verify your identity using established protocols
5. Change your password after the account is unlocked

## Common Causes of Account Lockouts
1. Entering incorrect passwords multiple times
2. Cached or saved old passwords in applications or devices
3. Multiple devices trying to connect with outdated credentials
4. Background services or scheduled tasks using expired credentials
5. Synchronization issues between on-premises and cloud accounts

## Checking for Saved Credentials
1. Clear saved passwords in web browsers
2. Update credentials in email clients and mobile devices
3. Check Credential Manager in Windows:
   - Control Panel > User Accounts > Credential Manager
4. Review saved connections in VPN clients
5. Check applications with stored credentials (e.g., OneDrive, Teams)

## Preventing Future Lockouts
1. Use a password manager to avoid typing errors
2. Enable password synchronization across systems when available
3. Update all devices when changing passwords
4. Log out of all sessions when changing passwords
5. Consider enabling single sign-on where available

## Strengthening Account Security
1. Enable multi-factor authentication
2. Use biometric authentication where available
3. Create a strong, memorable password
4. Use different passwords for different accounts
5. Check for compromised passwords using tools like Have I Been Pwned

## Enterprise Account Management
1. Implement graduated lockout policies
2. Use risk-based authentication to reduce false lockouts
3. Monitor for abnormal login patterns
4. Consider time-based lockout exceptions for critical roles
5. Establish streamlined processes for after-hours account unlocks`,
    category: "Account",
    tags: [
      "account lockout",
      "password reset",
      "authentication",
      "credentials",
      "login issues",
      "password management",
    ],
  },
  {
    title: "Setting Up Email Forwarding and Rules",
    summary:
      "How to configure email forwarding, filtering, and automated rules",
    content: `# Setting Up Email Forwarding and Rules

## Email Forwarding Basics
1. Outlook Desktop:
   - File > Account Settings > Account Settings
   - Email tab > double-click your account
   - Change settings > More Settings > Advanced tab
   - Add forwarding email address
2. Outlook Web:
   - Settings > Mail > Forwarding
   - Enable forwarding and enter the destination address
   - Choose whether to keep a copy of forwarded messages
3. Gmail:
   - Settings > See all settings > Forwarding and POP/IMAP
   - Click "Add a forwarding address"
   - Verify the address and select forwarding options

## Creating Email Rules
1. Outlook Desktop:
   - Home tab > Rules > Create Rule
   - Define conditions (sender, subject, etc.)
   - Set actions (move, categorize, flag)
   - Name and save the rule
2. Outlook Web:
   - Settings > Mail > Rules
   - New rule > Set conditions and actions
   - Review and save
3. Gmail:
   - Settings > See all settings > Filters and Blocked Addresses
   - Create a new filter
   - Set criteria and actions
   - Save the filter

## Useful Rule Examples
1. Category organization:
   - Move messages from specific domains to folders
   - Apply categories to messages containing keywords
2. Priority management:
   - Flag messages from your manager or key clients
   - Create alerts for high-priority messages
3. Noise reduction:
   - Move newsletter emails to a reading folder
   - Automatically delete or archive certain notifications
4. Workflow automation:
   - Forward specific emails to team members
   - Send automatic replies to certain messages

## Best Practices
1. Review and clean up rules periodically
2. Create specific rather than overly broad rules
3. Order rules by priority (most specific first)
4. Test rules with sample emails
5. Document complex rule sets for reference

## Common Issues and Solutions
1. Rules not triggering:
   - Verify rule conditions are precise
   - Check rule ordering (rules are processed in order)
   - Ensure the rule is enabled
2. Forwarding problems:
   - Check for forwarding restrictions in your organization
   - Verify the destination address is correct
   - Consider security implications of external forwarding
3. Too many rules:
   - Consolidate similar rules
   - Use conditional formatting instead of rules when possible
   - Prioritize based on workflow importance`,
    category: "Account",
    tags: [
      "email",
      "forwarding",
      "rules",
      "outlook",
      "gmail",
      "filters",
      "automation",
      "email management",
    ],
  },

  // Other Category
  {
    title: "Setting Up Multiple Monitors",
    summary: "Guide to configuring and troubleshooting multi-monitor displays",
    content: `# Setting Up Multiple Monitors

## Hardware Setup
1. Verify your computer supports multiple displays:
   - Check available ports (HDMI, DisplayPort, DVI, USB-C)
   - Ensure graphics card supports multiple monitors
2. Connect monitors to power and to your computer
3. Use appropriate adapters if needed (e.g., HDMI to DisplayPort)
4. Position monitors ergonomically on your desk
5. Consider using monitor arms or stands for better positioning

## Windows Configuration
1. Right-click desktop > Display settings
2. Scroll down to Multiple displays section
3. Click Detect if all monitors aren't showing
4. Configure each monitor:
   - Arrangement: Drag and position monitor icons to match physical layout
   - Scale: Adjust text and app size for each display
   - Resolution: Set optimal resolution for each monitor
   - Orientation: Change between landscape and portrait modes
5. Set your primary display (contains taskbar and Start menu)
6. Choose display mode: Extend, Duplicate, or Show on specific display only

## macOS Configuration
1. Apple menu > System Preferences > Displays
2. Click Arrangement tab
3. Drag the displays to match physical position
4. To set the primary display, drag the menu bar to the desired screen
5. Use Gather Windows button to find lost windows

## Common Issues and Solutions
1. Display not detected:
   - Check cable connections
   - Try different ports or cables
   - Update graphics drivers
   - Restart computer with monitors connected
2. Different resolutions causing alignment problems:
   - Match resolutions if possible
   - Adjust scaling to make text and interface elements similar size
3. Windows appearing on wrong monitor:
   - Use Win+Shift+Arrow keys to move windows between displays
   - Check primary monitor setting
4. Poor image quality:
   - Use digital connections (HDMI, DisplayPort) rather than VGA
   - Set monitors to their native resolution

## Advanced Tips
1. Use keyboard shortcuts:
   - Windows: Win+P for quick projection menu
   - macOS: Option+Brightness keys for display preferences
2. Consider third-party tools for enhanced control:
   - DisplayFusion
   - UltraMon
   - PowerToys FancyZones
3. Create custom monitor profiles for different scenarios
4. Use Night Light or blue light reduction features for better eye comfort
5. Adjust refresh rates individually for optimal performance`,
    category: "Other",
    tags: [
      "monitors",
      "display",
      "multi-monitor",
      "screen setup",
      "dual monitors",
      "hardware",
      "ergonomics",
    ],
  },
  {
    title: "Conference Room Equipment Guide",
    summary: "How to use and troubleshoot common conference room technology",
    content: `# Conference Room Equipment Guide

## Video Conference System Setup
1. Power on the main display/TV using the remote or control panel
2. Start the video conference system (e.g., Zoom Room, Teams Room)
3. If using a separate computer, connect via HDMI or wireless display adapter
4. Select the correct input source on the display
5. Test audio and video before the meeting starts

## Audio System Operation
1. Adjust room speaker volume using the control panel
2. For ceiling microphones, make sure they're not muted
3. If using tabletop microphones:
   - Position them in the center of the table
   - Keep 18-24 inches from participants
   - Avoid placing near laptops, projectors, or papers
4. For wireless microphones, check battery level before meetings

## Wireless Presentation Tools
1. Connect to the in-room WiFi network (credentials often on display or table tent)
2. For AirPlay or Chromecast:
   - Ensure your device is on the same network
   - Select the conference room from your device's casting menu
3. For wireless dongles (e.g., ClickShare, Barco):
   - Connect the USB button to your laptop
   - Wait for drivers to install if needed
   - Press the button to share your screen

## Troubleshooting Common Issues
1. No display:
   - Check power to the display and source devices
   - Verify input selection on the display
   - Try alternative cables or ports
2. Audio problems:
   - Check volume settings on both the room system and your device
   - Verify correct audio input/output selection
   - For echo, reduce room system volume or move microphones
3. Wireless connectivity:
   - Restart the wireless presentation device
   - Reconnect to the correct WiFi network
   - Update your device's casting/sharing software
4. Video conferencing issues:
   - Check internet connectivity
   - Restart the room system
   - Connect via phone as a backup for audio

## Room Booking and Scheduling
1. Check room availability on the room's tablet display or calendar system
2. Book rooms through your organization's calendar system
3. Release room reservations if no longer needed
4. For ad-hoc meetings, check the room's schedule display before use
5. Follow proper start/end times to respect others' reservations

## Ending Your Meeting
1. Disconnect your devices from the display system
2. End or leave the video conference completely
3. Return any equipment to its original location
4. For wireless peripherals, return to charging station
5. If applicable, use room controls to power down the system`,
    category: "Other",
    tags: [
      "conference room",
      "video conference",
      "projector",
      "meeting technology",
      "presentation",
      "audio visual",
      "equipment",
    ],
  },
];

const seedKnowledgeBase = async () => {
  try {
    // Clear existing entries
    await KnowledgeBase.deleteMany({});
    console.log("Previous knowledge base entries deleted successfully");

    // Insert knowledge base entries
    await KnowledgeBase.insertMany(knowledgeBaseEntries);
    console.log(
      `Successfully seeded ${knowledgeBaseEntries.length} knowledge base entries!`
    );

    // Summary of created data
    const categoryCounts = {};
    knowledgeBaseEntries.forEach((entry) => {
      categoryCounts[entry.category] =
        (categoryCounts[entry.category] || 0) + 1;
    });

    console.log(`
Data Summary:
------------
Total Knowledge Base Entries: ${knowledgeBaseEntries.length}
Category Distribution:`);

    for (const [category, count] of Object.entries(categoryCounts)) {
      console.log(`  - ${category}: ${count}`);
    }

    mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error seeding knowledge base:", error);
    process.exit(1);
  }
};

seedKnowledgeBase();
