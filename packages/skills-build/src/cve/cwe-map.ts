/**
 * Maps CWE IDs to the 8 existing section prefixes and provides human-readable names.
 */

export const CWE_TO_SECTION: Record<string, string> = {
	// Taint Analysis — input validation, data flow, neutralization
	"CWE-20": "taint",
	"CWE-74": "injection", // Generic injection parent — better in injection
	"CWE-129": "taint", // Improper Validation of Array Index
	"CWE-184": "taint", // Incomplete List of Disallowed Inputs
	"CWE-200": "taint", // Exposure of Sensitive Information
	"CWE-201": "taint", // Insertion of Sensitive Information Into Sent Data
	"CWE-252": "taint", // Unchecked Return Value
	"CWE-400": "web", // Uncontrolled Resource Consumption (DoS)
	"CWE-409": "web", // Improper Handling of Highly Compressed Data
	"CWE-497": "taint", // Exposure of Sensitive System Information
	"CWE-532": "taint", // Insertion of Sensitive Information into Log File
	"CWE-552": "auth", // Files or Directories Accessible to External Parties
	"CWE-610": "injection", // Externally Controlled Reference
	"CWE-693": "web", // Protection Mechanism Failure
	"CWE-707": "taint", // Improper Neutralization
	"CWE-754": "taint", // Improper Check for Unusual Conditions
	"CWE-755": "taint", // Improper Handling of Exceptional Conditions
	"CWE-758": "taint", // Reliance on Undefined Behavior
	"CWE-770": "web", // Allocation of Resources Without Limits
	"CWE-835": "memory", // Loop with Unreachable Exit Condition (Infinite Loop)
	"CWE-913": "injection", // Improper Control of Dynamically-Managed Code Resources
	"CWE-1188": "auth", // Insecure Default Initialization of Resource
	"CWE-1284": "taint", // Improper Validation of Specified Quantity in Input
	"CWE-1392": "auth", // Use of Default Credentials

	// Memory Safety
	"CWE-119": "memory",
	"CWE-120": "memory",
	"CWE-121": "memory",
	"CWE-122": "memory",
	"CWE-125": "memory",
	"CWE-126": "memory",
	"CWE-127": "memory",
	"CWE-131": "memory",
	"CWE-134": "memory",
	"CWE-170": "memory",
	"CWE-190": "memory",
	"CWE-191": "memory",
	"CWE-401": "memory",
	"CWE-415": "memory",
	"CWE-416": "memory",
	"CWE-457": "memory",
	"CWE-476": "memory",
	"CWE-617": "memory", // Reachable Assertion
	"CWE-704": "memory", // Incorrect Type Conversion
	"CWE-787": "memory",
	"CWE-822": "memory", // Untrusted Pointer Dereference
	"CWE-824": "memory",
	"CWE-843": "memory",
	"CWE-908": "memory", // Use of Uninitialized Resource

	// Injection Attacks
	"CWE-22": "injection", // Path Traversal
	"CWE-23": "injection", // Relative Path Traversal
	"CWE-36": "injection", // Absolute Path Traversal
	"CWE-59": "injection", // Improper Link Resolution (Symlink)
	"CWE-61": "injection", // UNIX Symbolic Link Following
	"CWE-73": "injection", // External Control of File Name or Path
	"CWE-77": "injection",
	"CWE-78": "injection",
	"CWE-79": "injection",
	"CWE-88": "injection", // Improper Neutralization of Argument Delimiters
	"CWE-89": "injection",
	"CWE-90": "injection",
	"CWE-91": "injection",
	"CWE-94": "injection",
	"CWE-95": "injection",
	"CWE-96": "injection",
	"CWE-97": "injection",
	"CWE-98": "injection",
	"CWE-99": "injection",
	"CWE-113": "injection",
	"CWE-434": "injection", // Unrestricted Upload of Dangerous File Type
	"CWE-502": "injection",
	"CWE-611": "injection", // Improper Restriction of XML External Entity (XXE)
	"CWE-640": "injection", // Weak Password Recovery Mechanism
	"CWE-917": "injection",
	"CWE-943": "injection",
	"CWE-1236": "injection", // Improper Neutralization of Formula Elements (CSV Injection)
	"CWE-1321": "injection",
	"CWE-1333": "injection",
	"CWE-1336": "injection", // Improper Neutralization of Special Elements in Template Engine

	// Authentication & Authorization
	"CWE-250": "auth", // Execution with Unnecessary Privileges
	"CWE-255": "auth",
	"CWE-259": "auth",
	"CWE-260": "auth",
	"CWE-266": "auth", // Incorrect Privilege Assignment
	"CWE-269": "auth",
	"CWE-276": "auth", // Incorrect Default Permissions
	"CWE-284": "auth",
	"CWE-285": "auth",
	"CWE-287": "auth",
	"CWE-288": "auth",
	"CWE-290": "auth",
	"CWE-306": "auth",
	"CWE-307": "auth",
	"CWE-312": "auth", // Cleartext Storage of Sensitive Information
	"CWE-319": "auth", // Cleartext Transmission of Sensitive Information
	"CWE-345": "auth",
	"CWE-347": "auth",
	"CWE-384": "auth",
	"CWE-428": "auth", // Unquoted Search Path or Element
	"CWE-522": "auth", // Insufficiently Protected Credentials
	"CWE-613": "auth",
	"CWE-639": "auth",
	"CWE-732": "auth", // Incorrect Permission Assignment for Critical Resource
	"CWE-798": "auth",
	"CWE-862": "auth",
	"CWE-863": "auth",
	"CWE-915": "auth", // Improperly Controlled Modification of Dynamically-Determined Object Attributes

	// Cryptographic Vulnerabilities
	"CWE-203": "crypto", // Observable Discrepancy (Side Channel)
	"CWE-295": "crypto", // Improper Certificate Validation
	"CWE-310": "crypto",
	"CWE-320": "crypto",
	"CWE-321": "crypto",
	"CWE-326": "crypto",
	"CWE-327": "crypto",
	"CWE-328": "crypto",
	"CWE-329": "crypto",
	"CWE-330": "crypto",
	"CWE-331": "crypto",
	"CWE-338": "crypto",

	// Concurrency & Race Conditions
	"CWE-362": "concurrency",
	"CWE-363": "concurrency", // Race Condition Enabling Link Following
	"CWE-366": "concurrency",
	"CWE-367": "concurrency",
	"CWE-377": "concurrency", // Insecure Temporary File
	"CWE-414": "concurrency",
	"CWE-820": "concurrency",
	"CWE-821": "concurrency",

	// Web & API Security
	"CWE-16": "web",
	"CWE-178": "web", // Improper Handling of Case Sensitivity
	"CWE-183": "web",
	"CWE-248": "web", // Uncaught Exception
	"CWE-346": "web",
	"CWE-352": "web",
	"CWE-444": "web",
	"CWE-601": "web",
	"CWE-614": "web",
	"CWE-918": "web",
	"CWE-942": "web",
	"CWE-1275": "web",

	// Supply Chain & Dependencies
	"CWE-426": "supply",
	"CWE-427": "supply",
	"CWE-494": "supply",
	"CWE-506": "supply",
	"CWE-507": "supply",
	"CWE-508": "supply",
	"CWE-509": "supply",
	"CWE-829": "supply",
	"CWE-830": "supply",
	"CWE-1104": "supply",
};

export const CWE_NAMES: Record<string, string> = {
	"CWE-16": "Configuration",
	"CWE-20": "Improper Input Validation",
	"CWE-22": "Path Traversal",
	"CWE-23": "Relative Path Traversal",
	"CWE-36": "Absolute Path Traversal",
	"CWE-59": "Improper Link Resolution (Symlink Following)",
	"CWE-61": "UNIX Symbolic Link Following",
	"CWE-73": "External Control of File Name or Path",
	"CWE-74": "Injection",
	"CWE-77": "Command Injection",
	"CWE-78": "OS Command Injection",
	"CWE-79": "Cross-site Scripting (XSS)",
	"CWE-88": "Improper Neutralization of Argument Delimiters",
	"CWE-89": "SQL Injection",
	"CWE-90": "LDAP Injection",
	"CWE-91": "XML Injection",
	"CWE-94": "Code Injection",
	"CWE-95": "Eval Injection",
	"CWE-96": "Static Code Injection",
	"CWE-97": "Server-Side Includes Injection",
	"CWE-98": "Remote File Inclusion",
	"CWE-99": "Resource Injection",
	"CWE-113": "HTTP Response Splitting",
	"CWE-119": "Buffer Errors",
	"CWE-120": "Classic Buffer Overflow",
	"CWE-121": "Stack-based Buffer Overflow",
	"CWE-122": "Heap-based Buffer Overflow",
	"CWE-125": "Out-of-bounds Read",
	"CWE-126": "Buffer Over-read",
	"CWE-127": "Buffer Under-read",
	"CWE-129": "Improper Validation of Array Index",
	"CWE-131": "Incorrect Buffer Size Calculation",
	"CWE-134": "Uncontrolled Format String",
	"CWE-170": "Improper Null Termination",
	"CWE-178": "Improper Handling of Case Sensitivity",
	"CWE-183": "Permissive List of Allowed Inputs",
	"CWE-184": "Incomplete List of Disallowed Inputs",
	"CWE-190": "Integer Overflow",
	"CWE-191": "Integer Underflow",
	"CWE-200": "Exposure of Sensitive Information",
	"CWE-201": "Insertion of Sensitive Information Into Sent Data",
	"CWE-203": "Observable Discrepancy (Side Channel)",
	"CWE-248": "Uncaught Exception",
	"CWE-250": "Execution with Unnecessary Privileges",
	"CWE-252": "Unchecked Return Value",
	"CWE-255": "Credentials Management Errors",
	"CWE-259": "Hard-coded Password",
	"CWE-260": "Password in Configuration File",
	"CWE-266": "Incorrect Privilege Assignment",
	"CWE-269": "Improper Privilege Management",
	"CWE-276": "Incorrect Default Permissions",
	"CWE-284": "Improper Access Control",
	"CWE-285": "Improper Authorization",
	"CWE-287": "Improper Authentication",
	"CWE-288": "Authentication Bypass Using Alternate Path",
	"CWE-290": "Authentication Bypass by Spoofing",
	"CWE-295": "Improper Certificate Validation",
	"CWE-306": "Missing Authentication for Critical Function",
	"CWE-307": "Improper Restriction of Excessive Authentication Attempts",
	"CWE-310": "Cryptographic Issues",
	"CWE-312": "Cleartext Storage of Sensitive Information",
	"CWE-319": "Cleartext Transmission of Sensitive Information",
	"CWE-320": "Key Management Errors",
	"CWE-321": "Hard-coded Cryptographic Key",
	"CWE-326": "Inadequate Encryption Strength",
	"CWE-327": "Use of Broken Crypto Algorithm",
	"CWE-328": "Use of Weak Hash",
	"CWE-329": "Not Using Unpredictable IV with CBC Mode",
	"CWE-330": "Use of Insufficiently Random Values",
	"CWE-331": "Insufficient Entropy",
	"CWE-338": "Use of Weak PRNG",
	"CWE-345": "Insufficient Verification of Data Authenticity",
	"CWE-346": "Origin Validation Error",
	"CWE-347": "Improper Verification of Cryptographic Signature",
	"CWE-352": "Cross-Site Request Forgery (CSRF)",
	"CWE-362": "Race Condition",
	"CWE-363": "Race Condition Enabling Link Following",
	"CWE-366": "Race Condition within Thread",
	"CWE-367": "TOCTOU Race Condition",
	"CWE-377": "Insecure Temporary File",
	"CWE-384": "Session Fixation",
	"CWE-400": "Uncontrolled Resource Consumption",
	"CWE-401": "Memory Leak",
	"CWE-409": "Improper Handling of Highly Compressed Data",
	"CWE-414": "Missing Lock Check",
	"CWE-415": "Double Free",
	"CWE-416": "Use After Free",
	"CWE-426": "Untrusted Search Path",
	"CWE-427": "Uncontrolled Search Path Element",
	"CWE-428": "Unquoted Search Path or Element",
	"CWE-434": "Unrestricted Upload of Dangerous File Type",
	"CWE-444": "HTTP Request/Response Smuggling",
	"CWE-457": "Use of Uninitialized Variable",
	"CWE-476": "NULL Pointer Dereference",
	"CWE-494": "Download of Code Without Integrity Check",
	"CWE-497": "Exposure of Sensitive System Information",
	"CWE-502": "Deserialization of Untrusted Data",
	"CWE-506": "Embedded Malicious Code",
	"CWE-507": "Trojan Horse",
	"CWE-508": "Non-Replicating Malicious Code",
	"CWE-509": "Replicating Malicious Code",
	"CWE-522": "Insufficiently Protected Credentials",
	"CWE-532": "Insertion of Sensitive Information into Log File",
	"CWE-552": "Files or Directories Accessible to External Parties",
	"CWE-601": "Open Redirect",
	"CWE-610": "Externally Controlled Reference",
	"CWE-611": "Improper Restriction of XML External Entity (XXE)",
	"CWE-613": "Insufficient Session Expiration",
	"CWE-614": "Sensitive Cookie Without Secure Flag",
	"CWE-617": "Reachable Assertion",
	"CWE-639": "Authorization Bypass Through User-Controlled Key",
	"CWE-640": "Weak Password Recovery Mechanism",
	"CWE-693": "Protection Mechanism Failure",
	"CWE-704": "Incorrect Type Conversion",
	"CWE-707": "Improper Neutralization",
	"CWE-732": "Incorrect Permission Assignment for Critical Resource",
	"CWE-754": "Improper Check for Unusual Conditions",
	"CWE-755": "Improper Handling of Exceptional Conditions",
	"CWE-758": "Reliance on Undefined Behavior",
	"CWE-770": "Allocation of Resources Without Limits",
	"CWE-787": "Out-of-bounds Write",
	"CWE-798": "Hard-coded Credentials",
	"CWE-820": "Missing Synchronization",
	"CWE-821": "Incorrect Synchronization",
	"CWE-822": "Untrusted Pointer Dereference",
	"CWE-824": "Access of Uninitialized Pointer",
	"CWE-829": "Inclusion of Functionality from Untrusted Control Sphere",
	"CWE-830": "Inclusion of Web Functionality from Untrusted Source",
	"CWE-835": "Loop with Unreachable Exit Condition (Infinite Loop)",
	"CWE-843": "Type Confusion",
	"CWE-862": "Missing Authorization",
	"CWE-863": "Incorrect Authorization",
	"CWE-908": "Use of Uninitialized Resource",
	"CWE-913": "Improper Control of Dynamically-Managed Code Resources",
	"CWE-915": "Improperly Controlled Modification of Object Attributes",
	"CWE-917": "Server-Side Template Injection",
	"CWE-918": "Server-Side Request Forgery (SSRF)",
	"CWE-942": "Permissive CORS Policy",
	"CWE-943": "Improper Neutralization in Data Query Logic",
	"CWE-1104": "Use of Unmaintained Third Party Components",
	"CWE-1188": "Insecure Default Initialization of Resource",
	"CWE-1236": "Improper Neutralization of Formula Elements (CSV Injection)",
	"CWE-1275": "Sensitive Cookie with Improper SameSite Attribute",
	"CWE-1284": "Improper Validation of Specified Quantity in Input",
	"CWE-1321": "Prototype Pollution",
	"CWE-1333": "Inefficient Regular Expression (ReDoS)",
	"CWE-1336": "Improper Neutralization in Template Engine",
	"CWE-1392": "Use of Default Credentials",
};

/**
 * Get the section prefix for a CWE ID, or null if unmapped.
 */
export function getSectionForCWE(cweId: string): string | null {
	return CWE_TO_SECTION[cweId] ?? null;
}

/**
 * Get the human-readable name for a CWE ID.
 */
export function getCWEName(cweId: string): string {
	return CWE_NAMES[cweId] ?? cweId;
}
