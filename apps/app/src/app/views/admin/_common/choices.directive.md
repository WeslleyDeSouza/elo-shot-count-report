# Choices.js Angular Directive

An Angular directive that integrates [Choices.js](https://github.com/Choices-js/Choices) with Angular reactive forms for enhanced select inputs.

## Installation

First, install Choices.js:

```bash
npm install choices.js
```

Import the CSS in your global styles or angular.json:

```scss
@import 'choices.js/public/assets/styles/choices.min.css';
```

## Usage

### Basic Select

```html
<select 
  class="form-control" 
  ngChoices
  formControlName="category">
  <option value="">Choose a category</option>
  <option value="1">Category 1</option>
  <option value="2">Category 2</option>
  <option value="3">Category 3</option>
</select>
```

### Multiple Select

```html
<select 
  class="form-control" 
  ngChoices
  multiple
  formControlName="tags">
  <option value="tag1">Tag 1</option>
  <option value="tag2">Tag 2</option>
  <option value="tag3">Tag 3</option>
</select>
```

### With Custom Options

```typescript
// Component
export class MyComponent {
  choicesOptions: ChoicesOptions = {
    searchEnabled: true,
    searchPlaceholderValue: 'Search items...',
    removeItemButton: true,
    placeholder: true,
    placeholderValue: 'Select items',
    noResultsText: 'No results found',
    itemSelectText: 'Press to select',
  };
}
```

```html
<select 
  class="form-control" 
  [ngChoices]="choicesOptions"
  formControlName="items">
  <option value="">Choose items</option>
  <option value="1">Item 1</option>
  <option value="2">Item 2</option>
  <option value="3">Item 3</option>
</select>
```

### Dynamic Choices

```typescript
// Component
export class MyComponent {
  @ViewChild(ChoicesDirective) choicesDirective!: ChoicesDirective;

  addNewChoices() {
    const newChoices = [
      { value: '4', label: 'Item 4' },
      { value: '5', label: 'Item 5' }
    ];
    
    this.choicesDirective.setChoices(newChoices, 'value', 'label', false);
  }

  clearAllChoices() {
    this.choicesDirective.clearChoices();
  }
}
```

## Configuration Options

The directive accepts all Choices.js configuration options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `searchEnabled` | boolean | true | Whether search functionality is enabled |
| `searchPlaceholderValue` | string | 'Search...' | Placeholder text for search input |
| `removeItemButton` | boolean | false (true for multiple) | Show remove button for items |
| `placeholder` | boolean | true | Whether to show placeholder |
| `placeholderValue` | string | 'Choose an option' | Placeholder text |
| `maxItemCount` | number | -1 | Maximum number of items (multiple select) |
| `shouldSort` | boolean | false | Whether to sort choices |
| `noResultsText` | string | 'No results found' | Text shown when no results |
| `noChoicesText` | string | 'No choices to choose from' | Text when no choices available |

## Public Methods

The directive exposes several methods for programmatic control:

```typescript
// Add a single choice
addChoice(choice: { value: string; label: string; disabled?: boolean; selected?: boolean }): void

// Set multiple choices
setChoices(choices: any[], value = 'value', label = 'label', replaceChoices = false): void

// Clear all choices
clearChoices(): void

// Clear input value
clearInput(): void

// Get current value
getValue(): any

// Enable/disable the select
enable(): void
disable(): void
```

## Styling

The directive automatically applies Bootstrap-compatible classes:

```scss
.choices {
  &.form-control {
    padding: 0;
    border: 1px solid #ced4da;
  }
  
  .choices__inner {
    padding: 0.375rem 0.75rem;
  }
  
  .choices__input {
    @extend .form-control-sm;
  }
}
```

## Example with Reactive Forms

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ChoicesDirective, ChoicesOptions } from '../_directives';

@Component({
  selector: 'app-example',
  template: \`
    <form [formGroup]="form">
      <div class="mb-3">
        <label class="form-label">Category</label>
        <select 
          class="form-control" 
          ngChoices
          formControlName="category">
          <option value="">Choose a category</option>
          <option value="areal">Areal</option>
          <option value="weapon">Weapon</option>
          <option value="office">Coordination Office</option>
        </select>
      </div>
      
      <div class="mb-3">
        <label class="form-label">Tags</label>
        <select 
          class="form-control" 
          [ngChoices]="multiSelectOptions"
          multiple
          formControlName="tags">
          <option value="important">Important</option>
          <option value="urgent">Urgent</option>
          <option value="review">Review</option>
          <option value="archived">Archived</option>
        </select>
      </div>
    </form>
  \`,
  imports: [ChoicesDirective]
})
export class ExampleComponent {
  form: FormGroup;
  
  multiSelectOptions: ChoicesOptions = {
    removeItemButton: true,
    searchEnabled: true,
    placeholder: true,
    placeholderValue: 'Select tags...'
  };

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      category: [''],
      tags: [[]]
    });
  }
}
```

## Integration Notes

- The directive implements `ControlValueAccessor` for seamless reactive forms integration
- Automatically detects single vs multiple select modes
- Handles form validation states
- Responsive and mobile-friendly
- Bootstrap 5 compatible styling