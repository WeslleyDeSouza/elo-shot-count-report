import { Directive, ElementRef, Input, OnInit, OnDestroy, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import Choices from 'choices.js';

export interface ChoicesOptions {
  searchEnabled?: boolean;
  searchChoices?: boolean;
  removeItemButton?: boolean;
  placeholder?: boolean;
  placeholderValue?: string;
  searchPlaceholderValue?: string;
  noResultsText?: string;
  noChoicesText?: string;
  itemSelectText?: string;
  maxItemCount?: number;
  shouldSort?: boolean;
  addItems?: boolean;
  duplicateItemsAllowed?: boolean;
}

@Directive({
  selector: '[ngChoices]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ChoicesDirective),
      multi: true
    }
  ]
})
export class ChoicesDirective implements OnInit, OnDestroy, ControlValueAccessor {
  private elementRef = inject(ElementRef);
  private choicesInstance: Choices | null = null;
  private value: any = null;
  private disabled = false;

  @Input('ngChoices') options: ChoicesOptions = {};

  // ControlValueAccessor callbacks
  private onChange = (_: any) => {};
  private onTouched = () => {};

  ngOnInit(): void {
    this.initializeChoices();
  }

  ngOnDestroy(): void {
    this.destroyChoices();
  }

  private initializeChoices(): void {
    if (this.choicesInstance) {
      this.destroyChoices();
    }

    const element = this.elementRef.nativeElement;
    const isMultiple = element.hasAttribute('multiple');
    
    const defaultOptions: any = {
      searchEnabled: true,
      searchChoices: true,
      searchPlaceholderValue: 'Search...',
      removeItemButton: isMultiple,
      itemSelectText: '',
      placeholder: true,
      placeholderValue: element.getAttribute('placeholder') || 'Choose an option',
      shouldSort: false,
      classNames: {
        containerOuter: 'choices form-control p-0 border-0',
        containerInner: 'choices__inner',
        input: 'choices__input form-control-sm',
        inputCloned: 'choices__input--cloned form-control-sm',
        list: 'choices__list',
        listItems: 'choices__list--multiple',
        listSingle: 'choices__list--single',
        listDropdown: 'choices__list--dropdown',
        item: 'choices__item',
        itemSelectable: 'choices__item--selectable',
        itemDisabled: 'choices__item--disabled',
        itemChoice: 'choices__item--choice',
        placeholder: 'choices__placeholder',
        group: 'choices__group',
        groupHeading: 'choices__heading',
        button: 'choices__button',
        activeState: 'is-active',
        focusState: 'is-focused',
        openState: 'is-open',
        disabledState: 'is-disabled',
        highlightedState: 'is-highlighted',
        selectedState: 'is-selected',
        flippedState: 'is-flipped',
        loadingState: 'is-loading',
        noResults: 'has-no-results',
        noChoices: 'has-no-choices'
      }
    };

    const mergedOptions = { ...defaultOptions, ...this.options };
    
    try {
      this.choicesInstance = new Choices(element, mergedOptions);
      
      // Set initial value if exists
      if (this.value !== null) {
        this.choicesInstance.setChoiceByValue(this.value);
      }

      // Set disabled state
      if (this.disabled) {
        this.choicesInstance.disable();
      }

      // Listen for changes
      element.addEventListener('change', this.handleChange.bind(this));
      element.addEventListener('choice', this.handleChoice.bind(this));
      element.addEventListener('removeItem', this.handleRemoveItem.bind(this));
      
    } catch (error) {
      console.error('Failed to initialize Choices.js:', error);
    }
  }

  private destroyChoices(): void {
    if (this.choicesInstance) {
      try {
        const element = this.elementRef.nativeElement;
        element.removeEventListener('change', this.handleChange.bind(this));
        element.removeEventListener('choice', this.handleChoice.bind(this));
        element.removeEventListener('removeItem', this.handleRemoveItem.bind(this));
        
        this.choicesInstance.destroy();
        this.choicesInstance = null;
      } catch (error) {
        console.error('Failed to destroy Choices.js:', error);
      }
    }
  }

  private handleChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.multiple 
      ? Array.from(target.selectedOptions).map(option => option.value)
      : target.value;
    
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }

  private handleChoice(): void {
    this.onTouched();
  }

  private handleRemoveItem(): void {
    // Update value when item is removed in multiple select
    const element = this.elementRef.nativeElement;
    if (element.multiple) {
      const options = Array.from(element.selectedOptions) as HTMLOptionElement[];
      const value = options.map(option => option.value);
      this.value = value;
      this.onChange(value);
    }
    this.onTouched();
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.value = value;
    if (this.choicesInstance) {
      if (value !== null && value !== undefined) {
        this.choicesInstance.setChoiceByValue(value);
      } else {
        this.choicesInstance.removeActiveItems();
      }
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.choicesInstance) {
      if (isDisabled) {
        this.choicesInstance.disable();
      } else {
        this.choicesInstance.enable();
      }
    }
  }

  // Public methods to interact with Choices instance
  public addChoice(choice: { value: string; label: string; disabled?: boolean; selected?: boolean }): void {
    if (this.choicesInstance) {
      this.choicesInstance.setChoices([choice], 'value', 'label', false);
    }
  }

  public setChoices(choices: any[], value = 'value', label = 'label', replaceChoices = false): void {
    if (this.choicesInstance) {
      this.choicesInstance.setChoices(choices, value, label, replaceChoices);
    }
  }

  public clearChoices(): void {
    if (this.choicesInstance) {
      this.choicesInstance.clearChoices();
    }
  }

  public clearInput(): void {
    if (this.choicesInstance) {
      this.choicesInstance.clearInput();
    }
  }

  public getValue(): any {
    if (this.choicesInstance) {
      return this.choicesInstance.getValue();
    }
    return this.value;
  }

  public enable(): void {
    if (this.choicesInstance) {
      this.choicesInstance.enable();
    }
    this.disabled = false;
  }

  public disable(): void {
    if (this.choicesInstance) {
      this.choicesInstance.disable();
    }
    this.disabled = true;
  }
}