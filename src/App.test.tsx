import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

describe("BetterMC public portal", () => {
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
      screen.getByRole("heading", { name: /Malaybalay public information/i }),
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
      screen.getAllByRole("link", { name: /Official source/i }).length,
    ).toBeGreaterThan(0);
  });

  it("lists DILG-sourced barangay leadership", () => {
    render(
      <MemoryRouter initialEntries={["/barangays"]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: /Every barangay/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Gregorio D. Jaroy")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /088-813-1357/ })).toHaveAttribute(
      "href",
      "tel:0888131357",
    );
    expect(
      screen.getAllByRole("link", { name: /Open barangay profile/i }).length,
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
    expect(screen.getByText("7,812")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /Service areas awaiting named assignments/i,
      }),
    ).toBeInTheDocument();
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
});
