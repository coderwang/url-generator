import Tippy from "@tippyjs/react";
import React, { useState } from "react";
import { hideAll } from "tippy.js";
import "tippy.js/animations/shift-away-subtle.css";
import "tippy.js/dist/tippy.css";
import styles from "./Dropdown.module.less";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
}) => {
  const [visible, setVisible] = useState(false);

  const selectedOption = options.find((o) => o.value === value);

  const handleSelect = (optionValue: string) => {
    hideAll();
    setVisible(false);
    if (optionValue !== value) {
      onChange(optionValue);
    }
  };

  return (
    <Tippy
      content={
        <div className={styles.menu}>
          {options.map((option) => (
            <div
              key={option.value}
              className={`${styles.menuItem} ${
                option.value === value ? styles.menuItemActive : ""
              }`}
              onClick={() => handleSelect(option.value)}
            >
              <span className={styles.menuItemLabel}>{option.label}</span>
              {option.value === value && (
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          ))}
        </div>
      }
      visible={visible}
      onClickOutside={() => setVisible(false)}
      interactive={true}
      placement="bottom-start"
      animation="shift-away-subtle"
      duration={[150, 100]}
      offset={[0, 4]}
      arrow={false}
      theme="dropdown"
      appendTo="parent"
      popperOptions={{
        modifiers: [
          {
            name: "sameWidth",
            enabled: true,
            phase: "beforeWrite",
            requires: ["computeStyles"],
            fn: ({ state }) => {
              const triggerWidth = state.rects.reference.width;
              state.styles.popper.width = `${Math.max(triggerWidth, 200)}px`;
            },
          },
        ],
      }}
    >
      <button
        className={`${styles.trigger} ${visible ? styles.triggerActive : ""}`}
        onClick={() => setVisible((v) => !v)}
        type="button"
      >
        <span className={styles.triggerLabel}>
          {selectedOption?.label || placeholder}
        </span>
        <svg
          className={`${styles.chevron} ${visible ? styles.chevronOpen : ""}`}
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </Tippy>
  );
};

export default Dropdown;
