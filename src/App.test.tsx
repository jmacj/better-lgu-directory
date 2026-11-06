import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import {
  barangayMicrosites,
  MALAYBALAY_2024_POPULATION,
} from "./barangayProfiles";
import { civicRecords } from "./data";
import { civicRecordContext } from "./civicRecordContext";

describe("BetterMC public portal", () => {
  it("provides current population context for all 46 barangay profiles", () => {
    expect(barangayMicrosites).toHaveLength(46);
    expect(
      barangayMicrosites.reduce(
        (total, barangay) => total + barangay.population,
        0,
      ),
    ).toBe(MALAYBALAY_2024_POPULATION);
    expect(
      new Set(barangayMicrosites.map((barangay) => barangay.populationRank)),
    ).toHaveProperty("size", 46);
    for (const barangay of barangayMicrosites) {
      expect(barangay.introduction).toContain(barangay.name);
      expect(barangay.populationSummary).toContain("46 barangays");
      expect(barangay.cityPopulationShare).toBeGreaterThan(0);
      expect(barangay.populationReleaseSource.url).toContain(
        "rsso10.psa.gov.ph",
      );
      expect(barangay.heroImage?.url).toMatch(/^\/images\//);
    }
    expect(
      barangayMicrosites.filter((barangay) =>
        barangay.heroImage?.url.includes("/barangay-heroes/"),
      ),
    ).toHaveLength(25);
    expect(
      barangayMicrosites.filter(
        (barangay) =>
          barangay.heroImage?.url ===
          "/images/malaybalay-city-hall-background.webp",
      ),
    ).toHaveLength(21);
  });

  it("renders the independent-platform disclosure and homepage purpose", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByText(/Independent public information platform/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Welcome to BetterMC/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Malaybalay time/i)).toBeInTheDocument();
    expect(screen.getByText("Not separately reported")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Operating income by source/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("₱1,188,506,575.00")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /Current operating income/i }),
    );
    expect(
      screen.getByRole("heading", { name: "Current operating income" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Next image" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByText(/not affiliated with, endorsed by, or operated by/i)
        .length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("link", { name: /Find every barangay/i }),
    ).toHaveAttribute("href", "/barangays");
  });

  it("lists source-linked transparency records", () => {
    render(
      <MemoryRouter initialEntries={["/transparency"]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: /Public records/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Annual Budget Report")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Infrastructure/i }),
    ).toHaveAttribute("href", expect.stringContaining("/infrastructure"));
    expect(
      screen.getAllByRole("link", { name: /View context for/i }).length,
    ).toBeGreaterThan(0);
  });

  it("lists DILG-sourced barangay leadership", () => {
    render(
      <MemoryRouter initialEntries={["/barangays"]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: /Explore all 46 barangays/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Gregorio D. Jaroy")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /088-813-1357/ })).toHaveAttribute(
      "href",
      "tel:0888131357",
    );
    expect(
      screen.getAllByRole("link", { name: /Open profile/i }).length,
    ).toBe(46);
  });

  it("renders a source-backed barangay landing page", () => {
    render(
      <MemoryRouter initialEntries={["/barangays/dalwangan"]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Dalwangan", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Royville C. Pasco").length).toBeGreaterThan(0);
    expect(screen.getAllByText("7,812").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", {
        name: /Barangay overview/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("8 of 46")).toBeInTheDocument();
    expect(screen.getByText("4.01%")).toBeInTheDocument();
    expect(
      screen.getByText(/Latest official count available in 2026/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: /2024 POPCEN highlights for Malaybalay City/i,
      }),
    ).toHaveAttribute("href", expect.stringContaining("rsso10.psa.gov.ph"));
    expect(
      screen.getByRole("heading", {
        name: /Common committee areas/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /Published projects mentioning Dalwangan/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/ITB-2026-/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Complete roster not published/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Urgent help across Malaybalay/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", {
        name: /DILG Barangay Officials Directory/i,
      }).length,
    ).toBeGreaterThan(0);
  });

  it("indexes searchable 2026 BAC notices without calling them awards", () => {
    render(
      <MemoryRouter initialEntries={["/procurement/bidding-opportunities"]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", {
        name: /2026 bidding opportunities/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/A bidding opportunity is not an award/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Show all 212 records/i })).toBeInTheDocument();
  });

  it("keeps award notices on dedicated internal procurement pages", () => {
    render(
      <MemoryRouter initialEntries={["/procurement/infrastructure-awards"]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: /Infrastructure award notices/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("ITB-2024-012")).toBeInTheDocument();
    expect(
      screen.getByText(/does not by itself prove payment/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Goods and services awards/i }),
    ).toHaveAttribute("href", "/procurement/goods-services-awards");
  });

  it("separates mayoral issuances, council ordinances, and institutional recognition", () => {
    render(
      <MemoryRouter initialEntries={["/government?tab=records"]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByText("Executive Order No. 23, Series of 2026"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Executive Order No. 19, Series of 2026"),
    ).toBeInTheDocument();
    expect(screen.getByText("Memorandum Circular No. 38")).toBeInTheDocument();
    expect(
      screen.getByText("Ordinance No. 1118, Series of 2026"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Verified recognition/i }),
    ).toBeInTheDocument();
  });

  it("keeps a sourced plain-language page for each published measure", () => {
    expect(Object.keys(civicRecordContext).sort()).toEqual(
      civicRecords.map((record) => record.number).sort(),
    );
    render(
      <MemoryRouter
        initialEntries={[
          "/legislation/executive-order-no-19-series-of-2026",
        ]}
      >
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", {
        name: "Executive Order No. 19, Series of 2026",
        level: 1,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /What this published measure does/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/Project Monitoring and Evaluation Information System/i)
        .length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText(/not evidence that a particular project was completed/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Open official source/i }),
    ).toHaveAttribute("href", expect.stringContaining("malaybalaycity.gov.ph"));
  });

  it("expands a leader profile with verified office contact details", () => {
    render(
      <MemoryRouter initialEntries={["/government"]}>
        <App />
      </MemoryRouter>,
    );
    fireEvent.click(
      screen.getAllByRole("button", { name: /^Details$/i })[0],
    );
    const expandedProfile = document.querySelector("article.expanded");
    expect(expandedProfile).not.toBeNull();
    const profile = within(expandedProfile as HTMLElement);
    expect(profile.getByText("City Mayor’s Office")).toBeInTheDocument();
    expect(
      profile.getByText(/New City Hall, National Highway/i),
    ).toBeInTheDocument();
    expect(
      profile.getByRole("link", { name: /0953-459-1777/ }),
    ).toHaveAttribute("href", "tel:09534591777");
    expect(
      profile.getByText(/mayoral office issuances indexed/i),
    ).toBeInTheDocument();
  });

  it("publishes distinct councilor contacts and committee assignments", () => {
    const { unmount } = render(
      <MemoryRouter
        initialEntries={[
          "/government?tab=officials&official=jason-chad-j-ayala",
        ]}
      >
        <App />
      </MemoryRouter>,
    );
    const expandedCouncilor = document.querySelector("article.expanded");
    expect(expandedCouncilor).not.toBeNull();
    const councilorProfile = within(expandedCouncilor as HTMLElement);
    expect(
      councilorProfile.getByText("Published constituency contact"),
    ).toBeInTheDocument();
    expect(
      councilorProfile.getByRole("link", { name: /0994-514-3081/ }),
    ).toHaveAttribute("href", "tel:09945143081");
    expect(councilorProfile.getByText("Quasi-Judicial")).toBeInTheDocument();
    expect(
      councilorProfile.getByText("Environment and Natural Resources"),
    ).toBeInTheDocument();
    unmount();

    render(
      <MemoryRouter
        initialEntries={[
          "/government?tab=officials&official=julius-n-manghano",
        ]}
      >
        <App />
      </MemoryRouter>,
    );
    const expandedAbcProfile = document.querySelector("article.expanded");
    expect(expandedAbcProfile).not.toBeNull();
    const abcProfile = within(expandedAbcProfile as HTMLElement);
    expect(
      abcProfile.getByText("Published constituency contact"),
    ).toBeInTheDocument();
    expect(
      abcProfile.getByRole("link", { name: /0951-692-1915/ }),
    ).toHaveAttribute("href", "tel:09516921915");
  });

  it("publishes contribution, city contact, Facebook, and BetterGov links in the footer", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("link", { name: /Contribute on GitHub/i }),
    ).toHaveAttribute("href", "https://github.com/lordzxxxx/bettermalaybalay");
    expect(
      screen.getByRole("link", { name: /0917 188 4225/i }),
    ).toHaveAttribute("href", "tel:09171884225");
    expect(
      screen.getByRole("link", { name: /Official Facebook page/i }),
    ).toHaveAttribute(
      "href",
      "https://www.facebook.com/profile.php?id=100063747444247",
    );
    expect(
      screen.getByRole("link", { name: /Powered by\s*BetterGov/i }),
    ).toHaveAttribute("href", "https://lgu.bettergov.ph/");
  });

  it("uses an accessible request-type menu with keyboard selection", () => {
    render(
      <MemoryRouter initialEntries={["/participate"]}>
        <App />
      </MemoryRouter>,
    );
    const trigger = screen.getByRole("button", { name: /Request type/i });
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const brokenLink = screen.getByRole("option", {
      name: "Report a broken link",
    });
    fireEvent.click(brokenLink);
    expect(trigger).toHaveTextContent("Report a broken link");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("publishes current service documents and locally stored official portraits", () => {
    const { unmount } = render(
      <MemoryRouter initialEntries={["/services"]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("link", { name: /2026 GAD Plan and Budget/i }),
    ).toHaveAttribute("href", expect.stringContaining("GPB-2026.pdf"));
    expect(
      screen.getByRole("heading", {
        name: /195,046 residents across 46 barangays/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Browse all charter editions/i }),
    ).toHaveAttribute(
      "href",
      "https://sakata.malaybalaycity.gov.ph/citizens-charter/",
    );
    unmount();

    render(
      <MemoryRouter initialEntries={["/government"]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("img", {
        name: /Jay Warren R. Pabillaran, City Mayor/i,
      }),
    ).toHaveAttribute(
      "src",
      "/images/officials/mayor-jay-warren-pabillaran.webp",
    );
  });
});
