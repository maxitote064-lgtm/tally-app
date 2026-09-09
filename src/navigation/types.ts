export type RootStackParamList = {
  Tabs: undefined;
  Detail: { txId: number };
  Budget: undefined;
  Goals: undefined;
  Notifications: undefined;
  Settings: undefined;
  Onboarding: undefined;
  Institutions: undefined;
  Consent: { institutionId: string };
  Authorization: { institutionId: string };
  Connections: undefined;
};

export type TabParamList = {
  Today: undefined;
  Accounts: undefined;
  Activity: undefined;
  Insights: undefined;
};
