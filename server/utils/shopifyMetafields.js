export const ANNOUNCEMENT_NAMESPACE = "my_app";
export const ANNOUNCEMENT_KEY = "announcement";
export const ANNOUNCEMENT_TYPE = "single_line_text_field";

const GET_SHOP_ANNOUNCEMENT = `#graphql
  query GetShopAnnouncement($namespace: String!, $key: String!) {
    shop {
      id
      name
      myshopifyDomain
      metafield(namespace: $namespace, key: $key) {
        id
        namespace
        key
        type
        value
        updatedAt
      }
    }
  }
`;

const SET_SHOP_ANNOUNCEMENT = `#graphql
  mutation SetShopAnnouncement($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        namespace
        key
        type
        value
        ownerType
        updatedAt
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

const GET_ANNOUNCEMENT_DEFINITION = `#graphql
  query GetAnnouncementDefinition($namespace: String!, $key: String!) {
    metafieldDefinitions(first: 1, ownerType: SHOP, namespace: $namespace, key: $key) {
      nodes {
        id
        namespace
        key
        access {
          admin
          storefront
        }
      }
    }
  }
`;

const CREATE_ANNOUNCEMENT_DEFINITION = `#graphql
  mutation CreateAnnouncementDefinition($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition {
        id
        namespace
        key
        access {
          admin
          storefront
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

function getGraphqlClient(shopify, session) {
  return new shopify.api.clients.Graphql({ session });
}

function assertNoGraphqlErrors(response) {
  if (response.errors) {
    throw new Error(JSON.stringify(response.errors));
  }
}

export async function getAnnouncementMetafield(shopify, session) {
  const client = getGraphqlClient(shopify, session);
  const response = await client.request(GET_SHOP_ANNOUNCEMENT, {
    variables: {
      namespace: ANNOUNCEMENT_NAMESPACE,
      key: ANNOUNCEMENT_KEY
    }
  });

  assertNoGraphqlErrors(response);

  return {
    shopId: response.data.shop.id,
    shopName: response.data.shop.name,
    myshopifyDomain: response.data.shop.myshopifyDomain,
    metafield: response.data.shop.metafield,
    text: response.data.shop.metafield?.value || ""
  };
}

export async function ensureAnnouncementMetafieldDefinition(shopify, session) {
  const client = getGraphqlClient(shopify, session);
  const existing = await client.request(GET_ANNOUNCEMENT_DEFINITION, {
    variables: {
      namespace: ANNOUNCEMENT_NAMESPACE,
      key: ANNOUNCEMENT_KEY
    }
  });

  assertNoGraphqlErrors(existing);

  const definition = existing.data.metafieldDefinitions.nodes[0];
  if (definition) {
    return definition;
  }

  const created = await client.request(CREATE_ANNOUNCEMENT_DEFINITION, {
    variables: {
      definition: {
        name: "Announcement Banner Text",
        namespace: ANNOUNCEMENT_NAMESPACE,
        key: ANNOUNCEMENT_KEY,
        description: "Store-wide announcement text displayed by the announcement banner app embed.",
        ownerType: "SHOP",
        type: ANNOUNCEMENT_TYPE,
        access: {
          storefront: "PUBLIC_READ"
        },
        validations: [{ name: "max", value: "300" }]
      }
    }
  });

  assertNoGraphqlErrors(created);

  const userErrors = created.data.metafieldDefinitionCreate.userErrors;
  if (userErrors.length > 0) {
    const message = userErrors.map((error) => `${error.code}: ${error.message}`).join("; ");
    throw new Error(message);
  }

  return created.data.metafieldDefinitionCreate.createdDefinition;
}

export async function setAnnouncementMetafield(shopify, session, text) {
  await ensureAnnouncementMetafieldDefinition(shopify, session);

  const shopData = await getAnnouncementMetafield(shopify, session);
  const client = getGraphqlClient(shopify, session);

  const response = await client.request(SET_SHOP_ANNOUNCEMENT, {
    variables: {
      metafields: [
        {
          ownerId: shopData.shopId,
          namespace: ANNOUNCEMENT_NAMESPACE,
          key: ANNOUNCEMENT_KEY,
          type: ANNOUNCEMENT_TYPE,
          value: text
        }
      ]
    }
  });

  assertNoGraphqlErrors(response);

  const userErrors = response.data.metafieldsSet.userErrors;
  if (userErrors.length > 0) {
    const message = userErrors.map((error) => `${error.code}: ${error.message}`).join("; ");
    throw new Error(message);
  }

  return {
    shop: shopData,
    metafield: response.data.metafieldsSet.metafields[0]
  };
}
