import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/common/StatusBadge';

describe('StatusBadge Component', () => {
  it('renders healthy status with proper label and dot', () => {
    render(<StatusBadge status="healthy" label="System Nominal" />);
    const badge = screen.getByText('System Nominal');
    expect(badge).toBeDefined();
  });

  it('renders critical incident badge', () => {
    render(<StatusBadge status="critical" label="CRITICAL" />);
    const badge = screen.getByText('CRITICAL');
    expect(badge).toBeDefined();
  });

  it('renders simulated active badge variant', () => {
    render(<StatusBadge variant="simulated" label="SIMULATED ACTIVE" />);
    const badge = screen.getByText('SIMULATED ACTIVE');
    expect(badge).toBeDefined();
  });

  it('renders awaiting hardware badge variant', () => {
    render(<StatusBadge variant="awaiting" label="AWAITING HARDWARE" />);
    const badge = screen.getByText('AWAITING HARDWARE');
    expect(badge).toBeDefined();
  });

  it('normalizes snake_case status when label is not provided', () => {
    render(<StatusBadge status="awaiting_integration" />);
    const badge = screen.getByText('awaiting integration');
    expect(badge).toBeDefined();
  });
});
