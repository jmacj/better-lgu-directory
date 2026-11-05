import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

describe('BetterMC public portal', () => {
  it('renders the independent-platform disclosure and homepage purpose', () => {
    render(<MemoryRouter><App /></MemoryRouter>)
    expect(screen.getByText(/Independent public information platform/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Malaybalay public information/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/Malaybalay time/i)).toBeInTheDocument()
    expect(screen.getByText('Not separately reported')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Operating income by source/i })).toBeInTheDocument()
    expect(screen.getByText('₱1,188,506,575.00')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Current operating income/i }))
    expect(screen.getByRole('heading', { name: 'Current operating income' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next image' })).not.toBeInTheDocument()
    expect(screen.getAllByText(/not affiliated with, endorsed by, or operated by/i).length).toBeGreaterThan(0)
  })

  it('lists source-linked transparency records', () => {
    render(<MemoryRouter initialEntries={['/transparency']}><App /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /Public records/i })).toBeInTheDocument()
    expect(screen.getByText('Annual Budget Report')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Infrastructure/i })).toHaveAttribute('href', expect.stringContaining('/infrastructure'))
    expect(screen.getAllByRole('link', { name: /Official source/i }).length).toBeGreaterThan(0)
  })

  it('lists DILG-sourced barangay leadership', () => {
    render(<MemoryRouter initialEntries={['/barangays']}><App /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /Every barangay/i })).toBeInTheDocument()
    expect(screen.getByText('Gregorio D. Jaroy')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /088-813-1357/ })).toHaveAttribute('href', 'tel:0888131357')
    expect(screen.getAllByRole('link', { name: /DILG officials directory/i }).length).toBe(46)
  })

  it('separates mayoral issuances, council ordinances, and institutional recognition', () => {
    render(<MemoryRouter initialEntries={['/government?tab=records']}><App /></MemoryRouter>)
    expect(screen.getByText('Executive Order No. 23, Series of 2026')).toBeInTheDocument()
    expect(screen.getByText('Executive Order No. 19, Series of 2026')).toBeInTheDocument()
    expect(screen.getByText('Memorandum Circular No. 38')).toBeInTheDocument()
    expect(screen.getByText('Ordinance No. 1118, Series of 2026')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Verified recognition/i })).toBeInTheDocument()
  })

  it('expands a leader profile with verified office contact details', () => {
    render(<MemoryRouter initialEntries={['/government']}><App /></MemoryRouter>)
    fireEvent.click(screen.getAllByRole('button', { name: /View verified details/i })[0])
    expect(screen.getByText('City Mayor’s Office')).toBeInTheDocument()
    expect(screen.getByText(/New City Hall, National Highway/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /0953-459-1777/ })).toHaveAttribute('href', 'tel:09534591777')
    expect(screen.getByText(/mayoral office issuances indexed/i)).toBeInTheDocument()
  })

  it('distinguishes direct, shared, and constituency contact routes', () => {
    const { unmount } = render(<MemoryRouter initialEntries={['/government?tab=officials&official=jason-chad-j-ayala']}><App /></MemoryRouter>)
    expect(screen.getByText('Shared legislative-office routing')).toBeInTheDocument()
    expect(screen.getByText(/No individual phone or email is published/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /0917-497-6861/ })).toHaveAttribute('href', 'tel:09174976861')
    unmount()

    render(<MemoryRouter initialEntries={['/government?tab=officials&official=julius-n-manghano']}><App /></MemoryRouter>)
    expect(screen.getByText('Published constituency contact')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /0951-692-1915/ })).toHaveAttribute('href', 'tel:09516921915')
  })

  it('publishes contribution, city contact, Facebook, and BetterGov links in the footer', () => {
    render(<MemoryRouter><App /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /Contribute on GitHub/i })).toHaveAttribute('href', 'https://github.com/lordzxxxx/bettermalaybalay')
    expect(screen.getByRole('link', { name: /0917 188 4225/i })).toHaveAttribute('href', 'tel:09171884225')
    expect(screen.getByRole('link', { name: /Official Facebook page/i })).toHaveAttribute('href', 'https://www.facebook.com/profile.php?id=100063747444247')
    expect(screen.getByRole('link', { name: /Powered by\s*BetterGov/i })).toHaveAttribute('href', 'https://lgu.bettergov.ph/')
  })
})
