import { useState, useRef, useEffect } from "react";

  
const WORD_DATA = [
  ["computer", "Monitor"],
  ["computer", "Dashboards"],
  ["computer", "Alarm Statistics"],
  ["computer", "Inventory"],
  ["computer", "Alerts"],
  ["computer", "Ticketing Alert History"],
  ["computer", "Auto Ticket"],
  ["computer", "Manual Ticket"],
  ["computer", "Resolved Alert"],
  ["computer", "Suppressed Alerts"],
  ["computer", "Hosts & Services"],
  ["computer", "Host & Service Search"],
  ["computer", "Host & Service History"],
  ["computer", "Host Problem History"],
  ["computer", "Service Problem History"],
  ["computer", "Stale Service"],
  ["computer", "Host Statistics"],
  ["computer", "Service Statistics"],
  ["computer", "Host Availability"],
  ["computer", "Service Availability"],
  ["computer", "Timeline"],
  ["computer", "Ping Status"],
  ["computer", "Inventory Service Status"],
  ["computer", "Maps"],
  ["computer", "GIS Map"],
  ["computer", "Network Topology"],
  ["computer", "Auto Discovered"],
  ["computer", "Traffic Analyzer"],
  ["computer", "Traffic Summary"],
  ["computer", "Traffic Chart"],
  ["computer", "Traffic Details"],
  ["computer", "GeoIP Mapping"],
  ["computer", "SNMP Traps"],
  ["computer", "Network Manager"],
  ["computer", "Project Inventory"],
  ["computer", "Project"],
  ["computer", "Vault"],
  ["computer", "Variable"],
  ["computer", "Playbook"],
  ["computer", "Network Configuration"],
  ["computer", "Config Wizard"],
  ["computer", "OS Upgrade"],
  ["computer", "Compliance"],
  ["computer", "Compliance Rules"],
  ["computer", "Compliance Suite"],
  ["computer", "OS Upload"],
  ["computer", "OS Download"],
  ["computer", "Administration"],
  ["computer", "User Logs"],
  ["computer", "Device Job Logs"],
  ["computer", "Northbound Operations"],
  ["computer", "Southbound Operations"],
  ["computer", "Health Check"],
  ["computer", "NMS Health Check"],
  ["computer", "Background Jobs"],
  ["computer", "Config Manager"],
  ["computer", "Backup Summary"],
  ["computer", "Compare"],
  ["computer", "History"],
  ["computer", "Backup Dashboard"],
  ["computer", "Backup Inventory"],
  ["computer", "Devices"],
  ["computer", "Groups"],
  ["computer", "Setup"],
  ["computer", "Host Management"],
  ["computer", "Host"],
  ["computer", "Discovered Hosts"],
  ["computer", "Manage Downtime"],
  ["computer", "Host Group"],
  ["computer", "Region"],
  ["computer", "City"],
  ["computer", "State"],
  ["computer", "Country"],
  ["computer", "Application"],
  ["computer", "Monitoring Instance"],
  ["computer", "Netflow Collectors"],
  ["computer", "MQTT Brokers"],
  ["computer", "Log Retention Policy"],
  ["computer", "Percipient Collector"],
  ["computer", "Monitoring"],
  ["computer", "Metric"],
  ["computer", "Monitoring Configuration"],
  ["computer", "SNMP Port"],
  ["computer", "Discovery Rules"],
  ["computer", "Host Discovery Rule"],
  ["computer", "Service Discovery Rule"],
  ["computer", "Switch Interface and Port Rule"],
  ["computer", "APM Configuration"],
  ["computer", "Top Services Rule"],
  ["computer", "Integrations"],
  ["computer", "Emails"],
  ["computer", "SMTP Configuration"],
  ["computer", "Notification Groups"],
  ["computer", "Ticketing Tool"],
  ["computer", "Remote Management"],
  ["computer", "SMS Gateway"],
  ["computer", "API Integrations"],
  ["computer", "Alert Center"],
  ["computer", "Notification"],
  ["computer", "Alert Notification"],
  ["computer", "Alert Configuration"],
  ["computer", "Suppressed Rules"],
  ["computer", "Traffic Alerts"],
  ["computer", "Snmp Trap"],
  ["computer", "Thresholds"],
  ["computer", "Infrastructure Thresholds"],
  ["computer", "Log Thresholds"],
  ["computer", "Nms Thresholds"],
  ["computer", "Application Thresholds"],
  ["computer", "User Management"],
  ["computer", "LDAP/AD Configuration"],
  ["computer", "Connection"],
  ["computer", "LDAP/AD Users"],
  ["computer", "LDAP/AD Groups"],
  ["computer", "Role Mapping"],
  ["computer", "Permission"],
  ["computer", "Permissions Upgrade"],
  ["computer", "Global Settings"],
  ["computer", "Inventory Attribute"],
  ["computer", "Operation Center"],
  ["computer", "Scheduler"],
  ["computer", "Tools"],
  ["computer", "Insight"],
  ["computer", "Predictive Analytics"],
  ["computer", "Host & Service Trends"],
  ["computer", "Top Alerters"],
  ["computer", "Traffic Trends"],
  ["computer", "Capacity Trends"],
  ["computer", "Anomaly"],
  ["computer", "Anomaly Detection"],
  ["computer", "Anomaly Details"],
  ["computer", "Npms"],
  ["computer", "Alert Trends"],
  ["computer", "Host Availability Trends"],
  ["computer", "Others"],
  ["computer", "Profile"],
  ["computer", "Change Password"],
  ["computer", "Vnc"],
  ["computer", "Dashboard"],
  ["computer", "Telnet"],
  ["computer", "Traceroute"],
  ["computer", "Service Discovery"],
  ["computer", "Alarm Intelligence"],
  ["computer", "Correlation"],
  ["computer", "license Upgrade"],
  ["computer", "SSH"],
  ["computer", "Log Analytics"],
  ["computer", "Log Viewer"],
  ["computer", "Application Log Viewer"],
  ["computer", "RCA"],
  ["computer", "Custom Reports"],
  ["computer", "Custom Dashboard"],
  ["computer", "Application Monitoring"],
  ["computer", "RUM Dashboard"],
  ["computer", "Widgets"],
  ["computer", "Application Dashboard"],
  ["computer", "Create New Dashboard"],
  ["computer", "User Satisfaction Metrics by Service"],
  ["computer", "Apdex Score Distribution by Service"],
  ["computer", "Apdex Score Trends Over Time by Service"],
  ["computer", "URL Monitoring"],
  ["computer", "Manage URLs"],
  ["computer", "URL Performance"],
  ["computer", "Search Trace"],
  ["computer", "Trace View"],
  ["computer", "Performance Overview"],
  ["computer", "Detailed Metrics"],
  ["computer", "APM Alerts"],
  ["computer", "Active"],
  ["computer", "Resolved"],
  ["computer", "Acknowledged"],
  ["computer", "Cloud Dashboard"],
  ["computer", "Infrastructure"],
  ["computer", "Data Center Management"],
  ["computer", "3D Floor Layout"],
  ["computer", "Rack Layout"],
  ["computer", "Rack Details"],
   ["computer", "Though"],
  ["computer", "Power"],
  ["computer", "Sweep"],
  ["computer", "Flake"],
  ["computer", "Mile"],
  ["computer", "Corporation"],
  ["computer", "Boom"],
  ["computer", "Signalling"],
  ["computer", "Auto-fare"],
  ["computer", "Frequency"],
  ["computer", "Peak"],
  ["computer", "Non-Peak"],
  ["computer", "Tenure"],
  ["computer", "Affirmative"],
  ["computer", "Depletion"],
  ["computer", "Abilities"],
  ["computer", "Inconvenience"],
  ["computer", "Adopted"],
  ["computer", "Renovated"],
  ["computer", "Timeframe"],
  ["computer", "Phase"],
  ["computer", "Utilities"],
  ["computer", "Alternate"],
  ["computer", "Massive"],
  ["computer", "Digging"],
  ["computer", "Drilling"],
  ["computer", "Barricades"],
  ["computer", "Execution"],
  ["computer", "Drought"],
  ["computer", "Foreign"],
  ["computer", "Infrastructure"],
  ["computer", "Aim"],
  ["computer", "Consideration"],
  ["computer", "Brick"],
  ["computer", "Belong"],
  ["computer", "Sight"],
  ["computer", "Mound"],
  ["computer", "Frosty"],
  ["computer", "Fizzy"],
  ["computer", "Might"],
  ["computer", "Cluster"],
  ["computer", "Garden"],
  ["computer", "Gate"],
  ["computer", "Game"],
  ["computer", "Gift"],
  ["computer", "Girl"],
  ["computer", "Goat"],
  ["computer", "Gold"],
  ["computer", "Google"],
  ["computer", "Green"],
  ["computer", "Glass"],
  ["computer", "Grapes"],
  ["computer", "Guitar"],
  ["computer", "Garage"],
  ["computer", "Galaxy"],
  ["computer", "Giant"],
  ["computer", "Ginger"],
  ["computer", "Globe"],
  ["computer", "Goal"],
  ["computer", "Ground"],
  ["computer", "Group"],
  ["computer", "Guide"],
  ["computer", "Guest"],
  ["computer", "Gym"],
  ["computer", "Gum"],
  ["computer", "Gun"],
  ["computer", "Grace"],
  ["computer", "Graph"],
  ["computer", "Growth"],
  ["computer", "Grove"],
  ["computer", "Greeting"],
  ["computer", "Ghost"],
  ["computer", "Ghoul"],
  ["computer", "Ghar"],
  ["computer", "Ghadi"],
  ["computer", "Ghee"],
  ["computer", "Ghat"],
  ["computer", "Ghagra"],
  ["computer", "Ghazal"],
  ["computer", "Gharana"],
  ["computer", "Gharial"],
  ["computer", "Ghoda"],
  ["computer", "Ghanti"],
  ["computer", "Ghera"],
  ["computer", "Ghumar"],
  ["computer", "Ghosh"],
  ["computer", "Ghutna"],
  ["computer", "Ghans"],
  ["computer", "Gham"],
  ["computer", "Gholna"],
  ["computer", "Ghumna"],
  ["computer", "Gharonda"],
  ["computer", "Khaki"],
  ["computer", "Khan"],
  ["computer", "Khalsa"],
  ["computer", "Khazana"],
  ["computer", "Khadi"],
  ["computer", "Kheer"],
  ["computer", "Khichdi"],
  ["computer", "Khiladi"],
  ["computer", "Khargosh"],
  ["computer", "Kharif"],
  ["computer", "Khet"],
  ["computer", "Khilona"],
  ["computer", "Khata"],
  ["computer", "Khamba"],
  ["computer", "Khand"],
  ["computer", "Khyal"],
  ["computer", "Khus"],
  ["computer", "Khur"],
  ["computer", "Khora"],
  ["computer", "Khokha"],
  ["computer", "Khal"],
  ["computer", "Kham"],
  ["computer", "Kharg"],
  ["computer", "Kharbuja"],
  ["computer", "Khat"],
  ["computer", "Khandaan"],
  ["computer", "Khoj"],
  ["computer", "Khush"],
  ["computer", "Kheera"],
  ["computer", "Angular"],
  ["computer", "React"],
  ["computer", "TypeScript"],
  ["computer", "JavaScript"],
  ["computer", "Python"],
  ["computer", "Django"],
  ["computer", "Celery"],
  ["computer", "PostgreSQL"],
  ["computer", "MySQL"],
  ["computer", "Docker"],
  ["computer", "Nginx"],
  ["computer", "API"],
  ["computer", "Cloud"],
  ["computer", "Monitoring"],
  ["computer", "Security"],
  ["computer", "Git"],
  ["computer", "CI/CD"],
  ["computer", "Topology"],
  ["computer", "Alarm"],
  ["computer", "Dashboard"],
  ["computer", "Database"],
  ["computer", "Network"],
  ["computer", "Node"],
  ["computer", "Edge"],
  ["computer", "Host"],
  ["computer", "Inventory"],
  ["computer", "Region"],
  ["computer", "Country"],
  ["computer", "State"],
  ["computer", "City"],
  ["computer", "Host Management"],
  ["computer", "Discovered Hosts"],
  ["computer", "Application"],
  ["computer", "Monitoring Instance"],
  ["computer", "Discovery Rules"],
  ["computer", "Host Discovery Rule"],
  ["computer", "Service Discovery Rule"],
  ["computer", "Switch Interface and Port Rule"],
  ["computer", "SNMP Port"],
  ["computer", "Monitoring Configuration"],
  ["computer", "Metric"],
  ["computer", "Integrations"],
  ["computer", "Emails"],
  ["computer", "SMTP Configuration"],
  ["computer", "Notification Groups"],
  ["computer", "Ticketing Tool"],
  ["computer", "SMS Gateway"],
  ["computer", "Upgrade"],
  ["computer", "Integrate"],
  ["computer", "Migrate"],
  ["computer", "Reconcile"],
  ["computer", "Automate"],
  ["computer", "Optimize"],
  ["computer", "Configure"],
  ["computer", "Enable"],
  ["computer", "Support"],
  ["computer", "Validate"],
  ["computer", "Monitor"],
  ["computer", "Discover"],
  ["computer", "Provision"],
  ["computer", "Expose"],
  ["computer", "Generate"],
  ["computer", "Centralize"],
  ["computer", "Standardize"],
  ["computer", "Nomination"],
  ["computer", "Quarter"],
  ["computer", "Submit"],
  ["computer", "NMS"],
  ["computer", "RUM"],
  ["computer", "OTEL"],
  ["computer", "SNMP"],
  ["computer", "SMTP"],
  ["computer", "SQL"],
  ["computer", "JSON"],
  ["computer", "HTML"],
  ["computer", "CSS"],
  ["computer", "UI"],
  ["computer", "UX"],
  ["computer", "VM"],
  ["computer", "IP"],
  ["computer", "DNS"],
  ["computer", "SSL"],
  ["computer", "TLS"],
  ["computer", "HTTP"],
  ["computer", "HTTPS"],
  ["computer", "CPU"],
  ["computer", "RAM"],
  ["computer", "DB"],
  ["computer", "DBMS"],
  ["Programming languages and frameworks","JavaScript"],
  ["Programming languages and frameworks","TypeScript"],
  ["Programming languages and frameworks","Python"],
  ["Programming languages and frameworks","Golang"],
  ["Programming languages and frameworks","Go"],
  ["Programming languages and frameworks","Node.js"],
  ["Programming languages and frameworks","NodeJs"],
  ["Programming languages and frameworks","React"],
  ["Programming languages and frameworks","Angular"],
  ["Programming languages and frameworks","Next.js"],
  ["Programming languages and frameworks","NestJS"],
  ["Programming languages and frameworks","Django"],
  ["Programming languages and frameworks","FastAPI"],
  ["Programming languages and frameworks","Express.js"],
  ["Programming languages and frameworks","jQuery"],
  ["Programming languages and frameworks","JSX"],
  ["Programming languages and frameworks","HTML"],
  ["Programming languages and frameworks","CSS"],
  ["Programming languages and frameworks","SQL"],
  ["Programming languages and frameworks","Bash"],
  ["Programming languages and frameworks","JSON"],
  ["Programming languages and frameworks","TOML"],
  ["Programming languages and frameworks","YAML"],
  ["Frontend development","Frontend"],
  ["Frontend development","Backend"],
  ["Frontend development","Fullstack"],
  ["Frontend development","Component"],
  ["Frontend development","Module"],
  ["Frontend development","Directive"],
  ["Frontend development","Pipe"],
  ["Frontend development","Service"],
  ["Frontend development","Controller"],
  ["Frontend development","Interceptor"],
  ["Frontend development","Middleware"],
  ["Frontend development","Dependency Injection"],
  ["Frontend development","Lifecycle"],
  ["Frontend development","Routing"],
  ["Frontend development","Navigation"],
  ["Frontend development","Template"],
  ["Frontend development","Binding"],
  ["Frontend development","Validation"],
  ["Frontend development","Form"],
  ["Frontend development","Reactive Forms"],
  ["Frontend development","Validator"],
  ["Frontend development","Dropdown"],
  ["Frontend development","Checkbox"],
  ["Frontend development","Pagination"],
  ["Frontend development","Datatable"],
  ["Frontend development","Bootstrap"],
  ["Frontend development","Responsive"],
  ["Frontend development","Rendering"],
  ["Frontend development","Change Detection"],
  ["Frontend development","Lazy Loading"],
  ["Frontend development","Observable"],
  ["Frontend development","Subscription"],
  ["Frontend development","Promise"],
  ["Frontend development","Callback"],
  ["Frontend development","Event"],
  ["Frontend development","Event Handling"],
  ["Frontend development","State Management"],
  ["Frontend development","Hooks"],
  ["Frontend development","DOM"],
  ["Frontend development","Virtual DOM"],
  ["Backend and API development","API"],
  ["Backend and API development","REST API"],
  ["Backend and API development","REST"],
  ["Backend and API development","WebSocket"],
  ["Backend and API development","Microservices"],
  ["Backend and API development","Endpoint"],
  ["Backend and API development","Request"],
  ["Backend and API development","Response"],
  ["Backend and API development","Payload"],
  ["Backend and API development","Header"],
  ["Backend and API development","Token"],
  ["Backend and API development","JWT"],
  ["Backend and API development","Authentication"],
  ["Backend and API development","Authorization"],
  ["Backend and API development","Credentials"],
  ["Backend and API development","Session"],
  ["Backend and API development","Cookie"],
  ["Backend and API development","CORS"],
  ["Backend and API development","Proxy"],
  ["Backend and API development","Middleware"],
  ["Backend and API development","Routing"],
  ["Backend and API development","Controller"],
  ["Backend and API development","Repository"],
  ["Backend and API development","Service Layer"],
  ["Backend and API development","Integration"],
  ["Backend and API development","Serialization"],
  ["Backend and API development","Deserialization"],
  ["Backend and API development","Parsing"],
  ["Backend and API development","Encryption"],
  ["Backend and API development","Decryption"],
  ["Backend and API development","Hashing"],
  ["Backend and API development","Rate Limiting"],
  ["Backend and API development","Pagination"],
  ["Backend and API development","Swagger"],
  ["Backend and API development","Axios"],
  ["Backend and API development","Uvicorn"],
  ["Backend and API development","Gunicorn"],
  ["Backend and API development","ASGI"],
  ["Database and SQL","PostgreSQL"],
  ["Database and SQL","MySQL"],
  ["Database and SQL","MongoDB"],
  ["Database and SQL","SQLite"],
  ["Database and SQL","TimescaleDB"],
  ["Database and SQL","Redis"],
  ["Database and SQL","pgvector"],
  ["Database and SQL","Database"],
  ["Database and SQL","Schema"],
  ["Database and SQL","Table"],
  ["Database and SQL","Column"],
  ["Database and SQL","Row"],
  ["Database and SQL","Index"],
  ["Database and SQL","Primary Key"],
  ["Database and SQL","Foreign Key"],
  ["Database and SQL","Constraint"],
  ["Database and SQL","Transaction"],
  ["Database and SQL","Query"],
  ["Database and SQL","Subquery"],
  ["Database and SQL","Join"],
  ["Database and SQL","Inner Join"],
  ["Database and SQL","Left Join"],
  ["Database and SQL","Group By"],
  ["Database and SQL","Order By"],
  ["Database and SQL","Aggregation"],
  ["Database and SQL","JSON Aggregation"],
  ["Database and SQL","Hypertable"],
  ["Database and SQL","Chunk"],
  ["Database and SQL","Compression"],
  ["Database and SQL","Retention"],
  ["Database and SQL","Migration"],
  ["Database and SQL","Backup"],
  ["Database and SQL","Restore"],
  ["Database and SQL","Connection Pool"],
  ["Database and SQL","Deadlock"],
  ["Database and SQL","Indexing"],
  ["Database and SQL","Execution Plan"],
  ["Database and SQL","Vector Search"],
  ["Database and SQL","Embeddings"],
  ["Database and SQL","SQL Injection"],
  ["Docker and DevOps","Docker"],
  ["Docker and DevOps","Docker Compose"],
  ["Docker and DevOps","Docker Swarm"],
  ["Docker and DevOps","Container"],
  ["Docker and DevOps","Image"],
  ["Docker and DevOps","Volume"],
  ["Docker and DevOps","Network"],
  ["Docker and DevOps","Stack"],
  ["Docker and DevOps","Service"],
  ["Docker and DevOps","Worker"],
  ["Docker and DevOps","Master"],
  ["Docker and DevOps","Node"],
  ["Docker and DevOps","Orchestration"],
  ["Docker and DevOps","Deployment"],
  ["Docker and DevOps","Build"],
  ["Docker and DevOps","Pipeline"],
  ["Docker and DevOps","CI/CD"],
  ["Docker and DevOps","Jenkins"],
  ["Docker and DevOps","GitLab"],
  ["Docker and DevOps","Git"],
  ["Docker and DevOps","GitHub"],
  ["Docker and DevOps","Repository"],
  ["Docker and DevOps","Branch"],
  ["Docker and DevOps","Commit"],
  ["Docker and DevOps","Merge"],
  ["Docker and DevOps","Rebase"],
  ["Docker and DevOps","Diff"],
  ["Docker and DevOps","Nginx"],
  ["Docker and DevOps","Linux"],
  ["Docker and DevOps","CentOS"],
  ["Docker and DevOps","Ubuntu"],
  ["Docker and DevOps","NVM"],
  ["Docker and DevOps","npm"],
  ["Docker and DevOps","Package"],
  ["Docker and DevOps","Dependency"],
  ["Docker and DevOps","Environment Variable"],
  ["Docker and DevOps","Configuration"],
  ["Docker and DevOps","Volume Plugin"],
  ["Docker and DevOps","GlusterFS"],
  ["Docker and DevOps","NFS"],
  ["Networking and infrastructure","Networking"],
  ["Networking and infrastructure","SNMP"],
  ["Networking and infrastructure","SNMP Trap"],
  ["Networking and infrastructure","SSH"],
  ["Networking and infrastructure","SSH Tunnel"],
  ["Networking and infrastructure","Ping"],
  ["Networking and infrastructure","ICMP"],
  ["Networking and infrastructure","TCP"],
  ["Networking and infrastructure","UDP"],
  ["Networking and infrastructure","HTTP"],
  ["Networking and infrastructure","HTTPS"],
  ["Networking and infrastructure","SSL"],
  ["Networking and infrastructure","TLS"],
  ["Networking and infrastructure","IP Address"],
  ["Networking and infrastructure","IPv4"],
  ["Networking and infrastructure","IPv6"],
  ["Networking and infrastructure","Subnet"],
  ["Networking and infrastructure","Gateway"],
  ["Networking and infrastructure","Firewall"],
  ["Networking and infrastructure","Port"],
  ["Networking and infrastructure","DNS"],
  ["Networking and infrastructure","Routing"],
  ["Networking and infrastructure","Load Balancer"],
  ["Networking and infrastructure","Reverse Proxy"],
  ["Networking and infrastructure","CORS"],
  ["Networking and infrastructure","Host"],
  ["Networking and infrastructure","Server"],
  ["Networking and infrastructure","Client"],
  ["Networking and infrastructure","Worker"],
  ["Networking and infrastructure","Master"],
  ["Networking and infrastructure","Network Interface"],
  ["Networking and infrastructure","Bandwidth"],
  ["Networking and infrastructure","Latency"],
  ["Networking and infrastructure","Throughput"],
  ["Networking and infrastructure","Packet"],
  ["Networking and infrastructure","Socket"],
  ["Networking and infrastructure","Tunnel"],
  ["Networking and infrastructure","VLAN"],
  ["Networking and infrastructure","MPLS"],
  ["Networking and infrastructure","DHCP"],
  ["Monitoring and observability","OpenTelemetry"],
  ["Monitoring and observability","OTEL"],
  ["Monitoring and observability","Telegraf"],
  ["Monitoring and observability","Prometheus"],
  ["Monitoring and observability","Grafana"],
  ["Monitoring and observability","Jaeger"],
  ["Monitoring and observability","Zipkin"],
  ["Monitoring and observability","TimescaleDB"],
  ["Monitoring and observability","Collector"],
  ["Monitoring and observability","Receiver"],
  ["Monitoring and observability","Exporter"],
  ["Monitoring and observability","Tracing"],
  ["Monitoring and observability","Metrics"],
  ["Monitoring and observability","Logs"],
  ["Monitoring and observability","Monitoring"],
  ["Monitoring and observability","Observability"],
  ["Monitoring and observability","Instrumentation"],
  ["Monitoring and observability","Telemetry"],
  ["Monitoring and observability","Trace"],
  ["Monitoring and observability","Span"],
  ["Monitoring and observability","Sampling"],
  ["Monitoring and observability","Dashboard"],
  ["Monitoring and observability","Alert"],
  ["Monitoring and observability","Alarm"],
  ["Monitoring and observability","Threshold"],
  ["Monitoring and observability","Performance"],
  ["Monitoring and observability","Availability"],
  ["Monitoring and observability","Uptime"],
  ["Monitoring and observability","Downtime"],
  ["Monitoring and observability","Latency"],
  ["Monitoring and observability","Throughput"],
  ["Monitoring and observability","Browser"],
  ["Monitoring and observability","RUM"],
  ["Monitoring and observability","Web Vitals"],
  ["Monitoring and observability","APM"],
  ["Monitoring and observability","OTLP"],
  ["Monitoring and observability","gRPC"],
  ["Monitoring and observability","HTTP Exporter"],
  ["Monitoring and observability","Metrics Endpoint"],
  ["Monitoring and observability","Trace Endpoint"],
  ["Network topology and visualization","Sigma.js"],
  ["Network topology and visualization","Graphology"],
  ["Network topology and visualization","D3.js"],
  ["Network topology and visualization","Cytoscape.js"],
  ["Network topology and visualization","Leaflet"],
  ["Network topology and visualization","GeoJSON"],
  ["Network topology and visualization","Force Simulation"],
  ["Network topology and visualization","Force-Directed"],
  ["Network topology and visualization","ForceAtlas2"],
  ["Network topology and visualization","Circular Layout"],
  ["Network topology and visualization","Grid Layout"],
  ["Network topology and visualization","Random Layout"],
  ["Network topology and visualization","Hierarchy"],
  ["Network topology and visualization","BFS"],
  ["Network topology and visualization","Drill-Down"],
  ["Network topology and visualization","Node"],
  ["Network topology and visualization","Edge"],
  ["Network topology and visualization","Vertex"],
  ["Network topology and visualization","Neighbour"],
  ["Network topology and visualization","Graph"],
  ["Network topology and visualization","Graph Database"],
  ["Network topology and visualization","Topology"],
  ["Network topology and visualization","Mesh"],
  ["Network topology and visualization","Ring"],
  ["Network topology and visualization","Cluster"],
  ["Network topology and visualization","Collision"],
  ["Network topology and visualization","Simulation"],
  ["Network topology and visualization","Coordinates"],
  ["Network topology and visualization","Latitude"],
  ["Network topology and visualization","Longitude"],
  ["Network topology and visualization","Map"],
  ["Network topology and visualization","Satellite"],
  ["Network topology and visualization","GeoJSON"],
  ["Network topology and visualization","Zoom"],
  ["Network topology and visualization","Pan"],
  ["Network topology and visualization","Rendering"],
  ["Network topology and visualization","SVG"],
  ["Network topology and visualization","Canvas"],
  ["Network topology and visualization","Layout"],
  ["Network topology and visualization","Hierarchical Layout"],
  ["Security and authentication","Security"],
  ["Security and authentication","CAPTCHA"],
  ["Security and authentication","JWT"],
  ["Security and authentication","Token"],
  ["Security and authentication","Authentication"],
  ["Security and authentication","Authorization"],
  ["Security and authentication","Encryption"],
  ["Security and authentication","Decryption"],
  ["Security and authentication","Hash"],
  ["Security and authentication","Password"],
  ["Security and authentication","Credential"],
  ["Security and authentication","Vulnerability"],
  ["Security and authentication","Audit"],
  ["Security and authentication","Certificate"],
  ["Security and authentication","SSL"],
  ["Security and authentication","TLS"],
  ["Security and authentication","Cipher"],
  ["Security and authentication","Host Header Injection"],
  ["Security and authentication","Content Security Policy"],
  ["Security and authentication","CSP"],
  ["Security and authentication","XSS"],
  ["Security and authentication","CSRF"],
  ["Security and authentication","SQL Injection"],
  ["Security and authentication","CORS"],
  ["Security and authentication","Access Control"],
  ["Security and authentication","Permission"],
  ["Security and authentication","Role"],
  ["Security and authentication","Session"],
  ["Security and authentication","Public Key"],
  ["Security and authentication","Private Key"],
  ["Security and authentication","SSH Key"],
  ["Security and authentication","Tunnel"],
  ["Security and authentication","Validation"],
  ["Security and authentication","Sanitization"],
  ["Software testing and QA","QA"],
  ["Software testing and QA","Testing"],
  ["Software testing and QA","Unit Testing"],
  ["Software testing and QA","Integration Testing"],
  ["Software testing and QA","Regression Testing"],
  ["Software testing and QA","Functional Testing"],
  ["Software testing and QA","Performance Testing"],
  ["Software testing and QA","Load Testing"],
  ["Software testing and QA","Test Case"],
  ["Software testing and QA","Test Scenario"],
  ["Software testing and QA","Test Coverage"],
  ["Software testing and QA","Defect"],
  ["Software testing and QA","Bug"],
  ["Software testing and QA","Issue"],
  ["Software testing and QA","Error"],
  ["Software testing and QA","Exception"],
  ["Software testing and QA","Debugging"],
  ["Software testing and QA","Troubleshooting"],
  ["Software testing and QA","Root Cause"],
  ["Software testing and QA","Resolution"],
  ["Software testing and QA","Reproduction"],
  ["Software testing and QA","Verification"],
  ["Software testing and QA","Validation"],
  ["Software testing and QA","Deployment"],
  ["Software testing and QA","Release"],
  ["Software testing and QA","Regression"],
  ["Software testing and QA","Environment"],
  ["Software testing and QA","Staging"],
  ["Software testing and QA","Production"],
  ["Software testing and QA","UAT"],
  ["Cloud and infrastructure services","AWS"],
  ["Cloud and infrastructure services","Azure"],
  ["Cloud and infrastructure services","GCP"],
  ["Cloud and infrastructure services","OCI"],
  ["Cloud and infrastructure services","Cloud"],
  ["Cloud and infrastructure services","Virtual Machine"],
  ["Cloud and infrastructure services","Instance"],
  ["Cloud and infrastructure services","Storage"],
  ["Cloud and infrastructure services","Compute"],
  ["Cloud and infrastructure services","Kubernetes"],
  ["Cloud and infrastructure services","Orchestration"],
  ["Cloud and infrastructure services","Containerization"],
  ["Cloud and infrastructure services","Scalability"],
  ["Cloud and infrastructure services","Availability"],
  ["Cloud and infrastructure services","High Availability"],
  ["Cloud and infrastructure services","Failover"],
  ["Cloud and infrastructure services","Replication"],
  ["Cloud and infrastructure services","Distributed System"],
  ["Cloud and infrastructure services","Cluster"],
  ["Cloud and infrastructure services","Multi-Cloud"],
  ["AI and modern development","Artificial Intelligence"],
  ["AI and modern development","AI"],
  ["AI and modern development","OpenAI"],
  ["AI and modern development","Embeddings"],
  ["AI and modern development","Vector Search"],
  ["AI and modern development","pgvector"],
  ["AI and modern development","Semantic Search"],
  ["AI and modern development","LLM"],
  ["AI and modern development","Prompt"],
  ["AI and modern development","Model"],
  ["AI and modern development","Context"],
  ["AI and modern development","Inference"],
  ["AI and modern development","API Integration"],
  ["AI and modern development","Retrieval"],
  ["AI and modern development","RAG"],
];

const INITIAL_DATA = WORD_DATA.map(([category, word], index) => ({
  id: index + 1,
  word,
  category,
}));

const CATEGORY_TABS = [
  ["all", "All topics"],
  ...Array.from(new Set(WORD_DATA.map(([category]) => category)), (category) => [category, category]),
];

const COLORS = ["--c1", "--c2", "--c3", "--c4"];
const matchCategory = (item, tab) => tab === "all" || item.category === tab;

const normalizeAnswer = (value) => value.normalize("NFC").trim().replace(/\s+/g, " ").toLowerCase();
const splitCharacters = (value) => {
  const word = value.normalize("NFC").trim();
  if (typeof Intl.Segmenter === "function") {
    return Array.from(
      new Intl.Segmenter("en", { granularity: "grapheme" }).segment(word),
      (part) => part.segment
    );
  }
  return Array.from(word);
};

// Show only some letters (first, last and every 3rd); mask the rest with *
const maskWord = (word) => {
  const chars = splitCharacters(word);
  return chars
    .map((ch, i) => {
      if (!/[\p{L}\p{N}]/u.test(ch)) return ch; // keep spaces . / - etc.
      const prev = chars[i - 1];
      const next = chars[i + 1];
      const startOfPart = i === 0 || !/[\p{L}\p{N}]/u.test(prev);
      const endOfPart = i === chars.length - 1 || !/[\p{L}\p{N}]/u.test(next);
      const partLen = (() => {
        let a = i, b = i;
        while (a > 0 && /[\p{L}\p{N}]/u.test(chars[a - 1])) a--;
        while (b < chars.length - 1 && /[\p{L}\p{N}]/u.test(chars[b + 1])) b++;
        return { a, len: b - a + 1 };
      })();
      const pos = i - partLen.a;
      if (startOfPart) return ch;
      if (partLen.len > 3 && (endOfPart || pos % 3 === 0)) return ch;
      return "*";
    })
    .join("");
};

const shuffle = (a) => {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const speak = (text, rate = 0.85, lang = "en-US") =>
  new Promise((resolve, reject) => {
    const engine = window.speechSynthesis;
    if (!engine || !window.SpeechSynthesisUtterance) {
      reject(new Error("Speech playback is not supported in this browser."));
      return;
    }
    try {
      engine.cancel();
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      const matchedVoice = engine
        .getVoices()
        .find((voice) => voice.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));
      if (matchedVoice) utterance.voice = matchedVoice;
      utterance.onend = () => resolve();
      utterance.onerror = (event) => {
        if (event.error !== "canceled" && event.error !== "interrupted") {
          reject(new Error(`Speech playback failed${event.error ? `: ${event.error}` : "."}`));
        } else {
          resolve();
        }
      };
      engine.speak(utterance);
    } catch (error) {
      reject(error);
    }
  });

export default function CommonWords() {
  const words = INITIAL_DATA;
  const [tab, setTab] = useState("all");
  const [cur, setCur] = useState(null);
  const [quizMode, setQuizMode] = useState(true);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [quizResult, setQuizResult] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [missed, setMissed] = useState([]);
  const [roundDone, setRoundDone] = useState(false);
  const [submitted, setSubmitted] = useState("");
  const inputRef = useRef(null);
  const advanceTimer = useRef(null);
  const goNextRef = useRef(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoPlaySeconds, setAutoPlaySeconds] = useState(5);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [help, setHelp] = useState(false);
  const [active, setActive] = useState(-1);
  const [progress, setProgress] = useState("");
  const [audioMessage, setAudioMessage] = useState("");
  const [listening, setListening] = useState(false);

  const readerRef = useRef(null);
  const st = useRef({ pool: [], seen: 0, total: 0, token: 0, recognition: null });
  const curRef = useRef(cur);
  curRef.current = cur;
  const wordsRef = useRef(words);
  wordsRef.current = words;

  useEffect(
    () => () => {
      window.clearTimeout(advanceTimer.current);
      window.speechSynthesis?.cancel();
      const recognition = st.current.recognition;
      if (recognition) {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.abort();
      }
    },
    []
  );

  useEffect(() => {
    const updateFullscreen = () => {
      setIsFullscreen(document.fullscreenElement === readerRef.current);
    };
    document.addEventListener("fullscreenchange", updateFullscreen);
    return () => document.removeEventListener("fullscreenchange", updateFullscreen);
  }, []);

  const toggleFullscreen = async () => {
    if (!readerRef.current) return;
    try {
      if (document.fullscreenElement === readerRef.current) {
        await document.exitFullscreen();
      } else if (typeof readerRef.current.requestFullscreen !== "function") {
        setAudioMessage("Fullscreen is not supported in this browser.");
      } else {
        await readerRef.current.requestFullscreen();
      }
    } catch (error) {
      setAudioMessage(`Could not change fullscreen mode: ${error.message}`);
    }
  };

  const playWord = async (text = curRef.current?.word || "", rate = 0.85, lang = "en-US") => {
    if (!text) return;
    const s = st.current;
    const token = ++s.token;
    s.recognition?.abort();
    s.recognition = null;
    setListening(false);
    setActive(-1);
    setAudioMessage("Playing pronunciation…");
    try {
      await speak(text, rate, lang);
      if (s.token === token) setAudioMessage("Audio finished.");
    } catch (error) {
      if (s.token === token) setAudioMessage(error.message || "Could not play audio.");
    }
  };

  const checkPronunciation = () => {
    if (!curRef.current) return;
    if (!window.isSecureContext) {
      setAudioMessage(
        "Microphone access requires a secure connection. Open this site over HTTPS."
      );
      return;
    }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setAudioMessage("Speech recognition is not supported in this browser. Try Hear it instead.");
      return;
    }
    const s = st.current;
    const token = ++s.token;
    window.speechSynthesis?.cancel();
    s.recognition?.abort();

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    s.recognition = recognition;
    setActive(-1);
    setListening(true);
    setAudioMessage("Listening… Say the English term clearly.");

    recognition.onresult = (event) => {
      if (s.token !== token) return;
      const expectedWord = curRef.current.word.trim();
      const heard = Array.from(event.results[0], (result) => result.transcript.trim());
      const matched = heard.some((transcript) => normalizeAnswer(transcript) === normalizeAnswer(expectedWord));
      setAudioMessage(
        matched
          ? `Speech recognition heard "${expectedWord}". Good match!`
          : `Heard "${heard[0] || "nothing"}" instead. Try again, or use Hear it as a guide.`
      );
    };

    recognition.onerror = (event) => {
      if (s.token !== token || event.error === "aborted") return;
      const message =
        event.error === "not-allowed"
          ? "Microphone access was denied. Allow microphone access to check your speech."
          : event.error === "no-speech"
          ? "No speech was detected. Try again and speak clearly."
          : event.error === "network"
          ? "Speech recognition could not connect. Check your internet connection."
          : `Speech check failed${event.error ? `: ${event.error}` : "."}`;
      setAudioMessage(message);
      setListening(false);
      s.recognition = null;
    };

    recognition.onend = () => {
      if (s.token !== token) return;
      setListening(false);
      s.recognition = null;
      setAudioMessage((message) =>
        message === "Listening… Say the English term clearly."
          ? "No word was recognized. Try again and speak clearly."
          : message
      );
    };

    try {
      recognition.start();
    } catch (error) {
      setListening(false);
      s.recognition = null;
      setAudioMessage(`Could not start speech recognition: ${error.message}`);
    }
  };

  const nextWord = (selectedTab, wordList = wordsRef.current) => {
    setQuizAnswer("");
    setQuizResult(null);
    const s = st.current;
    if (!s.pool.length) {
      const filtered = wordList.filter((item) => matchCategory(item, selectedTab));
      if (!filtered.length) {
        setCur(null);
        setProgress(`No terms found for ${selectedTab}`);
        setAudioMessage("");
        return;
      }
      s.pool = shuffle(filtered);
      s.seen = 0;
      s.total = s.pool.length;
    }
    const nextItem = s.pool.pop();
    s.seen++;
    s.token++;
    window.speechSynthesis?.cancel();
    s.recognition?.abort();
    s.recognition = null;
    setListening(false);
    setAudioMessage("");
    setCur(nextItem);
    setHelp(false);
    setActive(-1);
    setProgress(`Word ${s.seen} of ${s.total}`);
    return nextItem;
  };

  const resetQuizStats = () => {
    setScore({ correct: 0, total: 0 });
    setStreak(0);
    setBestStreak(0);
    setMissed([]);
    setRoundDone(false);
  };

  const startQuiz = (selectedTab = tab) => {
    resetQuizStats();
    st.current.pool = [];
    const item = nextWord(selectedTab);
    if (item) playWord(item.word);
  };

  const goNextQuestion = () => {
    window.clearTimeout(advanceTimer.current);
    if (st.current.pool.length === 0) {
      setRoundDone(true);
      return;
    }
    const item = nextWord(tab);
    if (item) playWord(item.word);
  };

  goNextRef.current = goNextQuestion;

  const skipQuestion = () => {
    if (!cur) return;
    if (quizResult === null) {
      setScore((x) => ({ ...x, total: x.total + 1 }));
      setStreak(0);
      setMissed((list) => (list.some((w) => w.id === cur.id) ? list : [...list, cur]));
    }
    goNextQuestion();
  };

  const retryMissed = () => {
    const s = st.current;
    s.pool = shuffle(missed);
    s.seen = 0;
    s.total = s.pool.length;
    resetQuizStats();
    const item = nextWord(tab);
    if (item) playWord(item.word);
  };

  const submitQuizAnswer = (event) => {
    event.preventDefault();
    if (!cur) return;
    if (quizResult !== null) {
      goNextQuestion();
      return;
    }
    if (!quizAnswer.trim()) {
      playWord(cur.word);
      return;
    }
    const ok = normalizeAnswer(quizAnswer) === normalizeAnswer(cur.word);
    setSubmitted(quizAnswer.trim());
    setQuizResult(ok);
    setScore((x) => ({ correct: x.correct + (ok ? 1 : 0), total: x.total + 1 }));
    if (ok) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = window.setTimeout(() => goNextRef.current?.(), 900);
      setStreak((x) => {
        setBestStreak((b) => Math.max(b, x + 1));
        return x + 1;
      });
    } else {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = window.setTimeout(() => goNextRef.current?.(), 3000);
      setStreak(0);
      setMissed((list) => (list.some((w) => w.id === cur.id) ? list : [...list, cur]));
    }
  };

  const pickTab = (selectedTab) => {
    setTab(selectedTab);
    st.current.pool = [];
    if (quizMode) resetQuizStats();
    nextWord(selectedTab);
  };

  useEffect(() => {
    if (quizMode) inputRef.current?.focus();
  }, [cur?.id, quizMode, roundDone, quizResult]);

  useEffect(() => {
    nextWord("all", INITIAL_DATA);
  }, []);

  useEffect(() => {
    if (!autoPlay || !cur || listening || quizMode) return undefined;
    const timer = window.setTimeout(() => nextWord(tab), autoPlaySeconds * 1000);
    return () => window.clearTimeout(timer);
  }, [autoPlay, autoPlaySeconds, cur?.id, listening, quizMode, tab]);

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName;
      if (e.key === " " && !quizMode && tag !== "BUTTON" && tag !== "INPUT" && tag !== "SELECT") {
        e.preventDefault();
        nextWord(tab);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [tab, words, quizMode]);

  const parts = cur?.word ? cur.word.split(/\s+/) : [];
  const quizLetters = cur ? splitCharacters(cur.word) : [];

  const onHelp = async () => {
    if (!cur) return;
    if (!help) {
      setHelp(true);
      return;
    }
    const s = st.current;
    const t = ++s.token;
    window.speechSynthesis?.cancel();
    s.recognition?.abort();
    s.recognition = null;
    setListening(false);
    setAudioMessage("Playing term slowly…");

    for (let i = 0; i < parts.length; i++) {
      if (s.token !== t) return;
      setActive(i);
      try {
        await speak(parts[i], 0.65, "en-US");
      } catch (error) {
        if (s.token === t) setAudioMessage(error.message || "Could not play audio.");
        setActive(-1);
        return;
      }
    }
    setActive(-1);
    if (s.token === t) {
      try {
        await speak(curRef.current.word, 0.8, "en-US");
        if (s.token === t) setAudioMessage("Audio finished.");
      } catch (error) {
        if (s.token === t) setAudioMessage(error.message || "Could not play audio.");
      }
    }
  };

  return (
    <div className="rwr" ref={readerRef}>
      <style>{CSS}</style>
      <main>
        <label className="topic-select">
          <span>Choose topic</span>
          <select
            aria-label="Choose topic"
            value={tab}
            onChange={(event) => pickTab(event.target.value)}
          >
            {CATEGORY_TABS.map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </label>

        {cur && !roundDone && (
          <div className="scoreboard" role="status" aria-live="polite">
            <div><span>Score</span><strong>{score.correct} / {score.total}</strong></div>
            <div><span>Accuracy</span><strong>{score.total ? Math.round((score.correct / score.total) * 100) : 0}%</strong></div>
            <div><span>Streak 🔥</span><strong>{streak}</strong></div>
            <div><span>Missed</span><strong>{missed.length}</strong></div>
            <div className="bar"><i style={{ width: `${st.current.total ? (score.total / st.current.total) * 100 : 0}%` }} /></div>
          </div>
        )}

        <div className="card">
          {cur && roundDone ? (
            <form
              className="quiz-card quiz-summary"
              onSubmit={(event) => {
                event.preventDefault();
                if (missed.length > 0) retryMissed();
                else startQuiz();
              }}
            >
              <p className="quiz-title">Round complete 🎉</p>
              <p className="big-score">{score.correct} / {score.total}</p>
              {missed.length > 0 && (
                <div className="missed-list">
                  <p>Words you missed:</p>
                  <ul>{missed.map((w) => <li key={w.id}>{w.word}</li>)}</ul>
                </div>
              )}
              <label htmlFor="word-quiz-answer">
                {missed.length > 0 ? "Press Enter to retry missed words" : "Press Enter to start a new round"}
              </label>
              <input id="word-quiz-answer" ref={inputRef} readOnly autoFocus placeholder="Press Enter" />
              <div className="quiz-actions">
                <button type="submit" className="a">{missed.length > 0 ? `Retry missed (${missed.length})` : "New round"}</button>
              </div>
            </form>
          ) : cur ? (
            <form className="quiz-card" onSubmit={submitQuizAnswer}>
              <p className="quiz-instruction">Topic: {cur.category}</p>
              <div className="masked" aria-label="Word with hidden letters">{maskWord(cur.word)}</div>
              <label htmlFor="word-quiz-answer">
                {quizResult === null ? "Type the word you hear, then press Submit" : "Press Enter for next"}
              </label>
              <input
                id="word-quiz-answer"
                ref={inputRef}
                className={quizResult === null ? "" : quizResult ? "ok" : "bad"}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                dir="auto"
                placeholder="Type here"
                readOnly={quizResult !== null}
                value={quizAnswer}
                onChange={(event) => setQuizAnswer(event.target.value)}
              />
              <div className={`quiz-feedback ${quizResult === null ? "" : quizResult ? "correct" : "incorrect"}`} role="status" aria-live="polite">
                {quizResult === true && "✓ Correct spelling!"}
                {quizResult === false && (
                  <>
                    <div>✗ Wrong spelling.</div>
                    <div className="answer-line">You typed: <s>{submitted}</s></div>
                    <div className="answer-line">Correct answer: <strong>{cur.word}</strong></div>
                  </>
                )}
              </div>
              <div className="quiz-actions">
                <button type="button" className="a alt" onClick={() => playWord(cur.word)}>
                  🔊 Hear word
                </button>
                <button type="submit" className="a" disabled={quizResult !== null || !quizAnswer.trim()}>
                  Submit
                </button>
                <button type="button" className={`a ${quizResult === false ? "" : "alt"}`} onClick={skipQuestion}>
                  {st.current.pool.length === 0 ? "See results →" : "Next →"}
                </button>
              </div>
            </form>
          ) : (
            <p>No terms found.</p>
          )}
        </div>

        <p className="stat">{progress}</p>
      </main>
    </div>
  );
}

const CSS = `
.rwr{--bg:#f4f7fb;--card:#fff;--ink:#16233b;--mute:#5b6b85;--line:#d5deeb;--acc:#2456d6;--acc-ink:#fff;--c1:#ffd36b;--c2:#9ed8ff;--c3:#b9f0c4;--c4:#ffc0d0;
background:var(--bg);color:var(--ink);min-height:100vh;font:18px/1.5 "Atkinson Hyperlegible",system-ui,-apple-system,"Segoe UI",sans-serif}
@media (prefers-color-scheme:dark){.rwr{--bg:#0f1729;--card:#18233b;--ink:#e8eefb;--mute:#9aaac6;--line:#2c3b5c;--acc:#6c96ff;--acc-ink:#0b1226;--c1:#c99a1c;--c2:#2f7fb5;--c3:#2f9a58;--c4:#b5476a}}
.rwr *{box-sizing:border-box}
.rwr main{max-width:640px;margin:0 auto;padding:20px 16px 40px}
.rwr .header-row{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:12px}
.rwr .fullscreen-button{white-space:nowrap}
.rwr:fullscreen{width:100vw;height:100vh;height:100dvh;overflow-y:auto;background:var(--bg)}
.rwr:fullscreen main{max-width:860px;padding-top:24px}
.rwr h1{font-size:1.5rem;margin:0}
.rwr .source-link{font-size:.9rem;color:var(--acc);text-decoration:none;font-weight:600}
.rwr .source-link:hover{text-decoration:underline}
.rwr .row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
.rwr .topic-select{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:0 0 14px;color:var(--mute);font-size:.9rem}
.rwr .topic-select select{width:100%;min-height:44px;padding:8px 12px;border:2px solid var(--line);border-radius:12px;background:var(--card);color:var(--ink);font:inherit}
.rwr .mode-controls{justify-content:center}
.rwr .autoplay-controls{align-items:center}
.rwr .autoplay-select{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:0;color:var(--mute);font-size:.9rem}
.rwr .autoplay-select select{width:auto;min-width:120px;min-height:42px;border:2px solid var(--line);border-radius:999px;background:var(--card);color:var(--ink);font:inherit;padding:6px 12px}
.rwr .quiz-card{max-width:520px;margin:0 auto;text-align:left}
.rwr .quiz-instruction{margin:0;color:var(--mute);text-align:center}
.rwr .quiz-clue{margin:4px 0 18px;font-size:clamp(1.5rem,6vw,2.2rem);font-weight:700;text-align:center;overflow-wrap:anywhere}
.rwr .masked{margin:10px 0 18px;text-align:center;font-size:clamp(1.8rem,8vw,2.8rem);font-weight:700;letter-spacing:.18em;font-family:ui-monospace,Menlo,Consolas,monospace;overflow-wrap:anywhere}
.rwr .quiz-title{margin:0 0 4px;font-size:1.4rem;font-weight:700;text-align:center}
.rwr .quiz-actions.top{justify-content:center;margin:14px 0 18px}
.rwr .quiz-actions.top .a{flex:0 1 auto;font-size:.9rem;padding:8px 16px}
.rwr .quiz-card input.ok{border-color:#1d8a4f;background:rgba(29,138,79,.1)}
.rwr .quiz-card input.bad{border-color:#c93b3b;background:rgba(201,59,59,.1)}
.rwr .answer-line{font-weight:600;color:var(--ink)}
.rwr .answer-line s{color:#c93b3b;text-decoration:line-through}
.rwr .answer-line strong{color:#1d8a4f;font-size:1.2em}
.rwr .quiz-feedback.correct{color:#1d8a4f}
.rwr .quiz-feedback.incorrect{color:#c93b3b}
.rwr .quiz-feedback.incorrect .answer-line strong{color:#1d8a4f}
.rwr .scoreboard{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px;padding:12px;background:var(--card);border:2px solid var(--line);border-radius:16px;text-align:center}
.rwr .scoreboard span{display:block;color:var(--mute);font-size:.75rem}
.rwr .scoreboard strong{font-size:1.3rem}
.rwr .scoreboard .bar{grid-column:1/-1;height:6px;border-radius:99px;background:var(--line);overflow:hidden}
.rwr .scoreboard .bar i{display:block;height:100%;background:var(--acc);transition:width .3s}
.rwr .big-score{margin:6px 0;font-size:3rem;font-weight:700;text-align:center}
.rwr .missed-list{margin:14px 0;text-align:left}
.rwr .missed-list p{margin:0 0 6px;color:var(--mute)}
.rwr .missed-list ul{margin:0;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:6px}
.rwr .missed-list li{padding:4px 12px;border-radius:999px;background:rgba(201,59,59,.12);color:#c93b3b;font-weight:600;font-size:.95rem}
.rwr .quiz-hints{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:16px}
.rwr .quiz-hints>div{display:grid;justify-items:center;gap:4px;padding:12px;border:1px solid var(--line);border-radius:14px;background:var(--bg)}
.rwr .quiz-hints span{color:var(--mute);font-size:.82rem}
.rwr .quiz-hints strong{font-size:1.7rem}
.rwr .quiz-card label{display:block;margin-bottom:5px;color:var(--mute);font-size:.9rem}
.rwr .quiz-card input{width:100%;min-height:48px;padding:10px 12px;border:2px solid var(--line);border-radius:12px;background:var(--bg);color:var(--ink);font:inherit}
.rwr .quiz-feedback{min-height:1.5em;margin:10px 0;color:var(--mute);font-weight:700}
.rwr .quiz-feedback.correct{color:#1d8a4f}
.rwr .quiz-feedback.incorrect{color:#c93b3b}
.rwr .quiz-actions{display:flex;flex-wrap:wrap;gap:8px}
.rwr .quiz-actions .a{flex:1 1 150px}
.rwr .f{border:2px solid var(--line);background:var(--card);color:var(--ink);font:inherit;padding:6px 14px;border-radius:999px;cursor:pointer;transition:background .15s,border-color .15s}
.rwr .f[aria-pressed="true"]{background:var(--acc);border-color:var(--acc);color:var(--acc-ink);font-weight:700}
.rwr .card{background:var(--card);border:2px solid var(--line);border-radius:20px;padding:28px 12px;text-align:center}
.rwr .word{font-size:clamp(2.5rem,12vw,4.5rem);font-weight:700;line-height:1.2;margin:8px 0 6px;word-break:break-word;min-height:1.2em}
.rwr .help{margin-top:6px}
.rwr .meaning{font-size:1.1rem;font-weight:600;color:var(--mute);margin-bottom:10px}
.rwr .chunks{display:flex;justify-content:center;flex-wrap:wrap;gap:6px}
.rwr .chunks span{font-size:clamp(1.5rem,7vw,2.4rem);font-weight:700;padding:2px 12px;border-radius:12px;color:#16233b;cursor:pointer}
.rwr .chunks span.on{outline:4px solid var(--acc)}
.rwr .tip{color:var(--mute);margin:10px 0 0}
.rwr .btns{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:20px}
.rwr button.a{border:0;background:var(--acc);color:var(--acc-ink);font:inherit;font-weight:700;font-size:1.05rem;padding:12px 22px;border-radius:14px;cursor:pointer}
.rwr button.a.alt{background:transparent;color:var(--ink);border:2px solid var(--line)}
.rwr button:disabled{opacity:.6;cursor:not-allowed}
.rwr button:focus-visible{outline:3px solid #ffc83d;outline-offset:2px}
.rwr .empty-state{padding:24px 0}
.rwr .stat{text-align:center;color:var(--mute);margin-top:14px}
.rwr .audio-status{min-height:1.5em;margin:12px 0 0;text-align:center;color:var(--mute);font-size:.9rem}
.rwr .note{color:var(--mute);font-size:.9rem;text-align:center;margin-top:20px}
.rwr .note a{color:var(--acc);text-decoration:none}
.rwr .note a:hover{text-decoration:underline}
`;