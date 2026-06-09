# Smart Food Redistribution System - Architecture & Flowchart

The following flowchart illustrates the entire lifecycle of a food donation within the platform, including the interactions between the three primary roles (Donor, NGO, Volunteer), the centralized logistics and matching engine, and the reputation system.

```mermaid
graph TD
    %% Define Styles
    classDef user fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    classDef system fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px;
    classDef database fill:#e8f5e9,stroke:#388e3c,stroke-width:2px;
    classDef admin fill:#ffe0b2,stroke:#f57c00,stroke-width:2px;
    classDef highlight fill:#fff3e0,stroke:#e65100,stroke-width:2px;

    %% Entry Points & Roles
    Start((Start)) --> Auth[Authentication & Role Verification]
    Auth --> RoleCheck{User Role?}
    
    RoleCheck -->|Donor / Restaurant| DonorDashboard[Donor Dashboard]:::user
    RoleCheck -->|NGO / Charity| NgoDashboard[NGO Dashboard]:::user
    RoleCheck -->|Volunteer| VolunteerDashboard[Volunteer Dashboard]:::user
    RoleCheck -->|Admin| AdminDashboard[Admin Dashboard]:::admin

    %% Donor Flow
    DonorDashboard --> |Creates| CreateDonation[Create Food Donation]
    CreateDonation --> |Inputs Details & Location| ValidationSystem[AI/Backend Validation]:::system
    ValidationSystem --> |Stores| DB[(MongoDB Database)]:::database
    ValidationSystem --> |Triggers| NotificationEngine[Socket.io Real-time Notifications]:::system

    %% Matching & Visibility
    DB --> |Pulls Available Donations| MatchingEngine[Proximity Matching Engine]:::system
    MatchingEngine --> |Broadcasts to nearby| NgoDashboard
    MatchingEngine --> |Broadcasts to nearby| VolunteerDashboard

    %% NGO Flow
    NgoDashboard --> |Views Nearby| ViewDonations[View Available Donations]
    ViewDonations --> |Accepts| AcceptDonation[Accept Donation]
    AcceptDonation --> |Updates Status to 'Accepted'| DB
    AcceptDonation --> |Notifies Donor| NotificationEngine

    %% Logistics & Volunteer Flow
    VolunteerDashboard --> |Views Accepted/Pending| TransportMatching[Logistics / Transport Matching]
    TransportMatching --> |Claims Delivery| PickupDonation[Mark as 'Picked Up']
    PickupDonation --> |Updates Status to 'Picked Up'| DB
    PickupDonation --> |Updates Map| MapView[Real-time Map Tracking]:::system

    %% Delivery & Completion
    PickupDonation --> |Delivers to NGO| DeliverDonation[Mark as 'Delivered']
    DeliverDonation --> |Updates Status to 'Delivered'| DB
    DeliverDonation --> |Notifies NGO & Donor| NotificationEngine

    %% Rating & Reputation System
    DeliverDonation --> TriggerRating[Trigger Rating Flow]:::highlight
    TriggerRating --> |Prompts NGO| NgoRating[NGO Rates Donor]
    TriggerRating --> |Prompts Donor| DonorRating[Donor Rates NGO/Volunteer]
    
    NgoRating --> CalcTrust[Calculate Trust Score]:::system
    DonorRating --> CalcTrust
    CalcTrust --> |Updates User Profiles| DB

    %% Admin Oversight
    AdminDashboard --> |Monitors| SystemMetrics[System Metrics & Analytics]
    AdminDashboard --> |Manages| UserManagement[User & Dispute Management]
    SystemMetrics -.-> DB
    UserManagement -.-> DB
```

## System Components Explained

1. **Role-Based Dashboards**: The entry points for the platform. Donors create supply, NGOs consume supply, and Volunteers act as the bridge when NGOs lack their own transport.
2. **Matching Engine**: Calculates geographical proximity using geospatial queries to ensure perishable food is routed to the nearest willing recipient.
3. **Logistics Tracker**: Follows the lifecycle of the `Donation` document (`Pending` -> `Accepted` -> `Picked Up` -> `Delivered`).
4. **Reputation Engine**: A crucial trust-building mechanism. Once a delivery completes, the system locks the state and triggers mutual feedback, adjusting global Trust Scores.
