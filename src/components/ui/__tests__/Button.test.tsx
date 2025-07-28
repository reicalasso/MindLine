import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button, { PrimaryButton, SecondaryButton, OutlineButton, GhostButton } from '../Button';

describe('Button Component', () => {
  test('renders button with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  test('applies correct variant classes', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('from-pink-500', 'to-purple-500');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('from-blue-500', 'to-cyan-500');

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('border-2', 'border-gray-300');

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-transparent');
  });

  test('applies correct size classes', () => {
    const { rerender } = render(<Button size="xs">Extra Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5', 'text-xs');

    rerender(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-4', 'py-2', 'text-sm');

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3', 'text-base');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-8', 'py-4', 'text-lg');

    rerender(<Button size="xl">Extra Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-10', 'py-5', 'text-xl');
  });

  test('handles loading state', () => {
    render(<Button loading>Loading</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText('Loading')).toHaveClass('opacity-75');
    
    // Check for loading spinner
    const svg = button.querySelector('svg');
    expect(svg).toHaveClass('animate-spin');
  });

  test('handles disabled state', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('calls onClick handler', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('does not call onClick when loading', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(<Button loading onClick={handleClick}>Loading</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  test('forwards ref', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref test</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  test('supports different button types', () => {
    const { rerender } = render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');

    rerender(<Button type="reset">Reset</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
  });

  test('includes data-testid when provided', () => {
    render(<Button data-testid="test-button">Test</Button>);
    expect(screen.getByTestId('test-button')).toBeInTheDocument();
  });

  describe('Convenience Components', () => {
    test('PrimaryButton renders with primary variant', () => {
      render(<PrimaryButton>Primary</PrimaryButton>);
      expect(screen.getByRole('button')).toHaveClass('from-pink-500', 'to-purple-500');
    });

    test('SecondaryButton renders with secondary variant', () => {
      render(<SecondaryButton>Secondary</SecondaryButton>);
      expect(screen.getByRole('button')).toHaveClass('from-blue-500', 'to-cyan-500');
    });

    test('OutlineButton renders with outline variant', () => {
      render(<OutlineButton>Outline</OutlineButton>);
      expect(screen.getByRole('button')).toHaveClass('border-2', 'border-gray-300');
    });

    test('GhostButton renders with ghost variant', () => {
      render(<GhostButton>Ghost</GhostButton>);
      expect(screen.getByRole('button')).toHaveClass('bg-transparent');
    });
  });

  describe('Accessibility', () => {
    test('button is focusable', async () => {
      const user = userEvent.setup();
      render(<Button>Focusable</Button>);
      
      const button = screen.getByRole('button');
      await user.tab();
      
      expect(button).toHaveFocus();
    });

    test('disabled button is not focusable', async () => {
      const user = userEvent.setup();
      render(<Button disabled>Not focusable</Button>);
      
      await user.tab();
      
      expect(screen.getByRole('button')).not.toHaveFocus();
    });

    test('button responds to Enter key', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      render(<Button onClick={handleClick}>Enter test</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('button responds to Space key', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      render(<Button onClick={handleClick}>Space test</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Performance', () => {
    test('does not re-render unnecessarily', () => {
      const renderSpy = jest.fn();
      
      const TestButton = React.memo(() => {
        renderSpy();
        return <Button>Test</Button>;
      });

      const { rerender } = render(<TestButton />);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<TestButton />);
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    test('handles undefined onClick gracefully', () => {
      render(<Button>No onClick</Button>);
      
      const button = screen.getByRole('button');
      expect(() => fireEvent.click(button)).not.toThrow();
    });

    test('handles empty children', () => {
      render(<Button />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('handles multiple children', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toContainHTML('<span>Icon</span><span>Text</span>');
    });
  });
});
