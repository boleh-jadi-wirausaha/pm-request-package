import { PMWidget } from "pm-request-widget";

export function App() {
  const local = "http://localhost:6767/api"
  const prod = "https://pm.bojawi.com/api"

  return (
    <div style={{ padding: 24 }}>
      <h1>pm-request-widget demo</h1>
      <PMWidget
        baseUrl={local}
        organizationId="00000000-0000-0000-0000-000000000001"
        corner="bottom-right"
        accentColor="blue"
        brandName="ITEL Learning System"
      />
    </div>
  );
}
