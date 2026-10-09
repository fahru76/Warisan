import { createBrowserRouter } from "react-router";
import { LegalPage } from "@warisan/ui";
import { NET_ROUTES } from "./routePaths";
import { Layout } from "./Layout";
import { HomePage } from "./pages/HomePage";
import { CraftPage } from "./pages/CraftPage";
import { WorkshopsPage } from "./pages/WorkshopsPage";
import { WorkshopPage } from "./pages/WorkshopPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { AccountPage } from "./pages/AccountPage";
import { NotFoundPage } from "./pages/NotFoundPage";

const SITE = "Warisan.net";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: NET_ROUTES.home, element: <HomePage /> },
      { path: NET_ROUTES.craft, element: <CraftPage /> },
      { path: NET_ROUTES.workshops, element: <WorkshopsPage /> },
      { path: NET_ROUTES.workshop, element: <WorkshopPage /> },
      { path: NET_ROUTES.checkout, element: <CheckoutPage /> },
      { path: NET_ROUTES.account, element: <AccountPage /> },
      { path: NET_ROUTES.privacy, element: <LegalPage doc="privacy" siteName={SITE} /> },
      { path: NET_ROUTES.terms, element: <LegalPage doc="terms" siteName={SITE} /> },
      { path: NET_ROUTES.vendor, element: <LegalPage doc="vendor" siteName={SITE} /> },
      { path: "*", element: <NotFoundPage /> }
    ]
  }
]);
