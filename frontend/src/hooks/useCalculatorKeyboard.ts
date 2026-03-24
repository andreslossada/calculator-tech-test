import { useEffect } from "react";

type Operation = "add" | "subtract" | "multiply" | "divide";

type UseCalculatorKeyboardParams = {
  onOperationChange: (operation: Operation) => void;
  onCalculate: () => void;
  onReset: () => void;
  onDigitInput?: (digit: string) => void;
  onDecimalInput?: () => void;
  onBackspaceInput?: () => void;
  onFocusNextField?: () => void;
  onFocusPreviousField?: () => void;
  isDisabled?: boolean;
};

const OPERATION_KEYS: Record<string, Operation> = {
  "+": "add",
  "-": "subtract",
  "*": "multiply",
  "/": "divide",
};

const isEditableElement = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tag = target.tagName;
  return (
    target.isContentEditable ||
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT"
  );
};

export const useCalculatorKeyboard = ({
  onOperationChange,
  onCalculate,
  onReset,
  onDigitInput,
  onDecimalInput,
  onBackspaceInput,
  onFocusNextField,
  onFocusPreviousField,
  isDisabled = false,
}: UseCalculatorKeyboardParams) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isDisabled || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      const isEditable = isEditableElement(event.target);

      if (!isEditable && event.key === "Tab") {
        event.preventDefault();

        if (event.shiftKey) {
          onFocusPreviousField?.();
        } else {
          onFocusNextField?.();
        }
        return;
      }

      if (!isEditable && /^\d$/.test(event.key)) {
        event.preventDefault();
        onDigitInput?.(event.key);
        return;
      }

      if (!isEditable && (event.key === "." || event.key === ",")) {
        event.preventDefault();
        onDecimalInput?.();
        return;
      }

      if (!isEditable && event.key === "Backspace") {
        event.preventDefault();
        onBackspaceInput?.();
        return;
      }

      const operation = OPERATION_KEYS[event.key];
      if (operation) {
        event.preventDefault();
        onOperationChange(operation);
        return;
      }

      if (event.key === "Enter" && !isEditable) {
        event.preventDefault();
        onCalculate();
        return;
      }

      if (
        (event.key === "Escape" || event.key.toLowerCase() === "c") &&
        !isEditable
      ) {
        event.preventDefault();
        onReset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isDisabled,
    onBackspaceInput,
    onCalculate,
    onDecimalInput,
    onDigitInput,
    onFocusNextField,
    onFocusPreviousField,
    onOperationChange,
    onReset,
  ]);
};
