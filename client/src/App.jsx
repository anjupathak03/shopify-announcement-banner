import { useEffect, useMemo, useState } from "react";
import createApp from "@shopify/app-bridge";
import { authenticatedFetch } from "@shopify/app-bridge/utilities/session-token";
import {
  AppProvider,
  Badge,
  Banner,
  BlockStack,
  Button,
  Card,
  DataTable,
  InlineStack,
  Layout,
  Link,
  Page,
  Text,
  TextField
} from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import "@shopify/polaris/build/esm/styles.css";

const DEMO_SHOP_DOMAIN = "announcement-banner-test-hxju0hhe.myshopify.com";

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function createShopifyFetch() {
  const apiKey = import.meta.env.VITE_SHOPIFY_API_KEY;
  const host = getQueryParam("host");

  if (!apiKey || !host) {
    return window.fetch.bind(window);
  }

  try {
    const app = createApp({
      apiKey,
      host,
      forceRedirect: true
    });

    return authenticatedFetch(app);
  } catch {
    return window.fetch.bind(window);
  }
}

async function parseJsonResponse(response) {
  const text = await response.text();
  let body = {};

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = {};
    }
  }

  if (!response.ok) {
    const plainText = text.trim().startsWith("<") ? "" : text.trim();
    const reauthorizeUrl = response.headers.get(
      "X-Shopify-API-Request-Failure-Reauthorize-Url"
    );
    const fallback = response.redirected
      ? "Shopify asked this request to re-authenticate. Refresh the app, then try again."
      : `Request failed (${response.status}).`;

    throw new Error(
      body.error ||
        (reauthorizeUrl
          ? "Your Shopify session expired. Refresh or reinstall the app, then try again."
          : plainText || fallback)
    );
  }

  return body;
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function syncBadge(status) {
  if (status === "synced") return <Badge tone="success">Synced</Badge>;
  if (status === "failed") return <Badge tone="critical">Failed</Badge>;
  return <Badge tone="attention">Pending</Badge>;
}

function DirectAccessPage() {
  return (
    <AppProvider i18n={enTranslations}>
      <Page title="Announcement Banner">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack gap="200" blockAlign="center">
                  <Badge tone="success">Deployed</Badge>
                  <Text as="p" tone="subdued">
                    Render service is live.
                  </Text>
                </InlineStack>

                <Text as="p">
                  Open the app from Shopify Admin to save announcement text.
                </Text>

                <InlineStack gap="300">
                  <Button
                    variant="primary"
                    url={`/api/auth?shop=${DEMO_SHOP_DOMAIN}`}
                  >
                    Open Shopify app
                  </Button>
                  <Button url="/healthz">Health check</Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </AppProvider>
  );
}

export default function App() {
  const [announcementText, setAnnouncementText] = useState("");
  const [history, setHistory] = useState([]);
  const [apiKey, setApiKey] = useState("");
  const [shop, setShop] = useState(getQueryParam("shop") || "");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const hasShopifyHost = Boolean(getQueryParam("host"));
  const shopifyFetch = useMemo(() => createShopifyFetch(), []);

  const themeEditorUrl = useMemo(() => {
    if (!shop || !apiKey) return "";
    return `https://${shop}/admin/themes/current/editor?context=apps&activateAppId=${apiKey}/announcement-banner`;
  }, [apiKey, shop]);

  async function loadAnnouncement() {
    setLoading(true);
    setNotice(null);

    try {
      const data = await shopifyFetch("/api/announcement", {
        credentials: "include"
      }).then(parseJsonResponse);

      setAnnouncementText(data.announcementText || "");
      setHistory(data.history || []);
      setApiKey(data.apiKey || "");
      setShop(data.shop || shop);
    } catch (error) {
      setNotice({ tone: "critical", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  async function saveAnnouncement() {
    setSaving(true);
    setNotice(null);

    try {
      const data = await shopifyFetch("/api/announcement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ text: announcementText })
      }).then(parseJsonResponse);

      setHistory((current) => [data.record, ...current].slice(0, 8));
      setNotice({ tone: "success", message: "Announcement saved and synced." });
    } catch (error) {
      setNotice({ tone: "critical", message: error.message });
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (hasShopifyHost) {
      loadAnnouncement();
    }
  }, [hasShopifyHost]);

  const rows = history.map((record) => [
    formatDate(record.savedAt),
    record.text,
    syncBadge(record.syncStatus)
  ]);

  if (!hasShopifyHost) {
    return <DirectAccessPage />;
  }

  return (
    <AppProvider i18n={enTranslations}>
      <Page
        title="Announcement Banner"
        primaryAction={{
          content: "Save",
          loading: saving,
          disabled: loading || saving,
          onAction: saveAnnouncement
        }}
        secondaryActions={
          themeEditorUrl
            ? [
                {
                  content: "Open theme editor",
                  url: themeEditorUrl,
                  external: true
                }
              ]
            : []
        }
      >
        <Layout>
          <Layout.Section>
            <BlockStack gap="400">
              {notice ? (
                <Banner tone={notice.tone} onDismiss={() => setNotice(null)}>
                  <p>{notice.message}</p>
                </Banner>
              ) : null}

              <Card>
                <BlockStack gap="400">
                  <TextField
                    label="Announcement Text"
                    value={announcementText}
                    onChange={setAnnouncementText}
                    maxLength={300}
                    showCharacterCount
                    autoComplete="off"
                    disabled={loading || saving}
                  />

                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="p" tone="subdued">
                      Metafield: shop.metafields.my_app.announcement
                    </Text>
                    <Button
                      variant="primary"
                      loading={saving}
                      disabled={loading || saving}
                      onClick={saveAnnouncement}
                    >
                      Save
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h2" variant="headingMd">
                      Audit History
                    </Text>
                    {themeEditorUrl ? <Link url={themeEditorUrl}>Theme editor</Link> : null}
                  </InlineStack>

                  <DataTable
                    columnContentTypes={["text", "text", "text"]}
                    headings={["Saved", "Text", "Status"]}
                    rows={rows}
                    loading={loading}
                  />
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </Page>
    </AppProvider>
  );
}
