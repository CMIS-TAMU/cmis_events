import type { TemplateVariableContext } from './template-variables';

// ============================================================================
// TEMPLATE ENGINE
// ============================================================================

export class TemplateEngine {
  /**
   * Replace simple variables like {{user.first_name}}
   */
  private replaceSimpleVariable(
    content: string,
    variable: string,
    value: unknown
  ): string {
    const regex = new RegExp(`{{\\s*${this.escapeRegex(variable)}\\s*}}`, 'g');
    return content.replace(regex, String(value || ''));
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Replace nested variables like {{user.first_name}}
   */
  private replaceNestedVariable(
    content: string,
    path: string,
    context: TemplateVariableContext
  ): string {
    const parts = path.split('.');
    let value: unknown = context;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        return content; // Variable not found, don't replace
      }
    }

    const regex = new RegExp(`{{\\s*${this.escapeRegex(path)}\\s*}}`, 'g');
    return content.replace(regex, String(value || ''));
  }

  /**
   * Render a list variable like {{upcoming_events}}
   */
  private renderList(
    content: string,
    variableName: string,
    items: unknown[],
    template?: string
  ): string {
    const regex = new RegExp(
      `{{\\s*${this.escapeRegex(variableName)}\\s*}}`,
      'g'
    );

    if (items.length === 0) {
      return content.replace(regex, 'No items available.');
    }

    if (template) {
      // Use custom template for each item
      const rendered = items
        .map((item) => {
          let itemTemplate = template;
          // Replace item variables
          if (typeof item === 'object' && item !== null) {
            for (const [key, value] of Object.entries(item)) {
              itemTemplate = itemTemplate.replace(
                new RegExp(`{{\\s*item\\.${this.escapeRegex(key)}\\s*}}`, 'g'),
                String(value || '')
              );
            }
          }
          return itemTemplate;
        })
        .join('\n');

      return content.replace(regex, rendered);
    }

    // Default list rendering
    const listItems = items
      .map((item) => {
        if (typeof item === 'object' && item !== null) {
          return Object.entries(item)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
        }
        return String(item);
      })
      .join('\n• ');

    return content.replace(regex, `• ${listItems}`);
  }

  /**
   * Render template with variables
   */
  render(
    template: string,
    context: TemplateVariableContext
  ): string {
    let result = template;

    // Replace nested variables (e.g., {{user.first_name}})
    const nestedVarRegex = /{{\s*([a-zA-Z_][a-zA-Z0-9_.]*)\s*}}/g;
    let match;
    const processed = new Set<string>();

    while ((match = nestedVarRegex.exec(result)) !== null) {
      const fullMatch = match[0];
      const variablePath = match[1];

      if (processed.has(fullMatch)) continue;
      processed.add(fullMatch);

      // Check if it's a list variable
      const listValue = this.getNestedValue(context, variablePath);
      if (Array.isArray(listValue)) {
        result = this.renderList(result, variablePath, listValue);
        continue;
      }

      // Regular nested variable
      const value = this.getNestedValue(context, variablePath);
      if (value !== undefined) {
        result = result.replace(
          new RegExp(this.escapeRegex(fullMatch), 'g'),
          String(value)
        );
      }
    }

    // Replace simple variables (e.g., {{variable_name}})
    for (const [key, value] of Object.entries(context)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Handle nested objects
        for (const [nestedKey, nestedValue] of Object.entries(value)) {
          result = this.replaceSimpleVariable(
            result,
            `${key}.${nestedKey}`,
            nestedValue
          );
        }
      } else if (!Array.isArray(value)) {
        result = this.replaceSimpleVariable(result, key, value);
      }
    }

    return result;
  }

  /**
   * Get nested value from context
   */
  private getNestedValue(
    context: TemplateVariableContext,
    path: string
  ): unknown {
    const parts = path.split('.');
    let value: unknown = context;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Validate template variables
   */
  validateTemplate(template: string): {
    valid: boolean;
    missingVariables: string[];
    errors: string[];
  } {
    const result = {
      valid: true,
      missingVariables: [] as string[],
      errors: [] as string[],
    };

    // Extract all variables from template
    const varRegex = /{{\s*([a-zA-Z_][a-zA-Z0-9_.]*)\s*}}/g;
    const variables = new Set<string>();
    let match;

    while ((match = varRegex.exec(template)) !== null) {
      variables.add(match[1]);
    }

    // Check for common issues
    for (const variable of variables) {
      // Check for invalid syntax
      if (variable.includes('..')) {
        result.errors.push(`Invalid variable syntax: ${variable} (contains '..')`);
        result.valid = false;
      }

      // Note: We can't check if variables exist without a context
      // This would be done during rendering
    }

    return result;
  }

  /**
   * Get all variables used in template
   */
  extractVariables(template: string): string[] {
    const varRegex = /{{\s*([a-zA-Z_][a-zA-Z0-9_.]*)\s*}}/g;
    const variables = new Set<string>();
    let match;

    while ((match = varRegex.exec(template)) !== null) {
      variables.add(match[1]);
    }

    return Array.from(variables);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const templateEngine = new TemplateEngine();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Render template with context (convenience function)
 */
export async function renderTemplate(
  template: string,
  context: TemplateVariableContext
): Promise<string> {
  return templateEngine.render(template, context);
}

/**
 * Validate template syntax
 */
export function validateTemplate(template: string): {
  valid: boolean;
  missingVariables: string[];
  errors: string[];
} {
  return templateEngine.validateTemplate(template);
}

/**
 * Extract all variables from template
 */
export function extractTemplateVariables(template: string): string[] {
  return templateEngine.extractVariables(template);
}
