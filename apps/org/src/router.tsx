import { createBrowserRouter } from "react-router";
import { LegalPage } from "@warisan/ui";
import { ORG_ROUTES } from "./routePaths";
import { Layout } from "./Layout";
import { HomePage } from "./pages/HomePage";
import { DirectoryPage } from "./pages/DirectoryPage";
import { ArtisanPage } from "./pages/ArtisanPage";
import { ProvenanceLookupPage, ProvenancePage } from "./pages/ProvenancePage";
import { RegisterPage } from "./pages/RegisterPage";
import { AdminPage } from "./pages/AdminPage";
import { NotFoundPage } from "./pages/NotFoundPage";

const SITE = "Warisan.org";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: ORG_ROUTES.home, element: <HomePage /> },
      { path: ORG_ROUTES.artisans, element: <DirectoryPage /> },
      { path: ORG_ROUTES.artisan, element: <ArtisanPage /> },
      { path: ORG_ROUTES.provenanceLookup, element: <ProvenanceLookupPage /> },
      { path: ORG_ROUTES.provenance, element: <ProvenancePage /> },
      { path: ORG_ROUTES.register, element: <RegisterPage /> },
      { path: ORG_ROUTES.admin, element: <AdminPage /> },
      { path: ORG_ROUTES.privacy, element: <LegalPage doc="privacy" siteName={SITE} /> },
      { path: ORG_ROUTES.terms, element: <LegalPage doc="terms" siteName={SITE} /> },
      { path: ORG_ROUTES.vendor, element: <LegalPage doc="vendor" siteName={SITE} /> },
      { path: "*", element: <NotFoundPage /> }
    ]
  }
]);
