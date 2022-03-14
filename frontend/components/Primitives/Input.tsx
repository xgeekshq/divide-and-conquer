import React, { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import Text from "./Text";
import { styled } from "../../stitches.config";
import Flex from "./Flex";
import isEmpty from "../../utils/isEmpty";
import InfoIcon from "../../public/icons/info.svg";
import EyeIcon from "../../public/icons/eye.svg";

const StyledInput = styled("input", {
  // Reset
  appearance: "none",
  borderWidth: "0",
  boxSizing: "border-box",
  margin: "0",
  outlineOffset: "0",
  padding: "0",
  fontFamily: "$body",
  WebkitTapHighlightColor: "rgba(0,0,0,0)",
  backgroundColor: "$white",
  "&::before": {
    boxSizing: "border-box",
  },
  "&::after": {
    boxSizing: "border-box",
  },
  "&:-internal-autofill-selected": {
    backgroundColor: "$white",
  },

  "&:-webkit-autofill,&:-webkit-autofill:active,&:-webkit-autofill:focus": {
    "-webkit-box-shadow":
      "0 0 0px 1000px white inset, 0px 0px 0px 2px var(--colors-successLightest)",
  },

  "&:-webkit-autofill::first-line": {
    color: "$dangerBase",
    fontFamily: "DM Sans, sans-serif",
    fontSize: "$16",
  },

  ":-internal-autofill-previewed": {
    fontFamily: "DM Sans, sans-serif",
    fontSize: "$16",
  },

  // Custom

  display: "flex",
  fontSize: "$16",
  px: "$16",
  boxShadow: "0",
  border: "1px solid $primary200",
  outline: "none",
  borderRadius: "$4",
  lineHeight: "$20",
  pt: "$28",
  pb: "$8",
  "&::-webkit-input-placeholder": {
    fontSize: "22px !important",
    color: "$primary300",
  },
  "&:disabled": {
    backgroundColor: "$primary50",
  },
  variants: {
    variant: {
      default: {
        "&:focus": {
          borderColor: "$primary400",
          boxShadow: "0px 0px 0px 2px var(--colors-primaryLightest)",
        },
        "&:-webkit-autofill": {
          "-webkit-box-shadow":
            "0 0 0px 1000px white inset, 0px 0px 0px 2px var(--colors-primaryLightest)",
        },
      },
      valid: {
        borderColor: "$success700",
        boxShadow: "0px 0px 0px 2px var(--colors-successLightest)",
        "&:-webkit-autofill": {
          "-webkit-box-shadow":
            "0 0 0px 1000px white inset, 0px 0px 0px 2px var(--colors-successLightest)",
        },
      },
      error: {
        borderColor: "$danger700",
        boxShadow: "0px 0px 0px 2px var(--colors-dangerLightest)",
        "&:-webkit-autofill": {
          "-webkit-box-shadow":
            "0 0 0px 1000px white inset, 0px 0px 0px 2px var(--colors-dangerLightest)",
        },
      },
    },
  },
  color: "$primaryBase",
  "&::placeholder": {
    "&:disabled": {
      color: "$primaryBase",
    },
    color: "$primary300",
  },
});

type StyledInpupProps = React.ComponentProps<typeof StyledInput>;

interface InputProps extends StyledInpupProps {
  id: string;
  type: "text" | "password" | "email" | "number" | "tel" | "url";
  placeholder: string;
  icon?: "eye";
  helperText?: string;
  iconPosition?: "left" | "right";
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({
  id,
  placeholder,
  icon,
  iconPosition,
  helperText,
  type,
  disabled,
  css,
}) => {
  Input.defaultProps = {
    iconPosition: "left",
    icon: undefined,
    helperText: "",
    disabled: false,
  };
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [currentType, setType] = useState(type);
  const isIconLeft = iconPosition === "left";
  const isIconRight = iconPosition === "right";

  const values = useFormContext();
  const { ref, ...rest } = values.register(id);
  const {
    formState: { errors },
  } = values;
  const isValueEmpty = isEmpty(values.getValues()[id]);
  const state = errors[`${id}`] ? "error" : isValueEmpty ? "default" : "valid";

  const handleOnClickIcon = () => {
    if (type === "text") return;
    setType(currentType === "password" ? "text" : "password");
  };

  useEffect(() => {
    if (id === "password") inputRef.current?.focus();
    setTimeout(() => {
      if (id === "email") inputRef.current?.focus();
    }, 50);
  }, []);

  return (
    <Flex
      direction="column"
      css={{ position: "relative", width: "100%", mb: "$16", height: "auto", ...css }}
      onBlur={() => {
        if (isValueEmpty) {
          values.clearErrors();
        }
      }}
    >
      {!!icon && (
        <Flex
          onClick={handleOnClickIcon}
          css={{
            position: "absolute",
            top: "$16",
            left: isIconLeft ? "$16" : "undefined",
            right: isIconRight ? "$16" : "undefined",
            "&:hover": {
              cursor: type === "password" ? "pointer" : "default",
            },
          }}
        >
          {icon === "eye" && <EyeIcon />}
        </Flex>
      )}
      <Flex>
        <StyledInput
          {...rest}
          ref={(e) => {
            ref(e);
            inputRef.current = e;
          }}
          id={id}
          placeholder=" "
          disabled={disabled}
          type={currentType}
          variant={state}
          data-state={state}
          autoComplete="off"
          css={{
            height: "$56",
            width: "100%",
            "&:not(:placeholder-shown) ~ label": {
              transform: `scale(0.875) translateX(${
                icon && isIconLeft ? "0.5rem" : "0.1rem"
              }) translateY(-0.5rem)`,
            },
            "&:focus ~ label": {
              transform: `scale(0.875) translateX(${
                icon && isIconLeft ? "0.5rem" : "0.1rem"
              }) translateY(-0.5rem)`,
            },
            pl: icon && isIconLeft ? "$56" : "$16",
            pr: icon && iconPosition === "right" ? "$56" : "$16",
          }}
        />
        <Text
          as="label"
          htmlFor={id}
          css={{
            fontSize: "$16",
            p: "$16",
            pl: icon && isIconLeft ? "$57" : "$17",
            top: "0",
            lineHeight: "$24",
            color: "$primary300",
            position: "absolute",
            pointerEvents: "none",
            transformOrigin: "0 0",
            transition: "all .2s ease-in-out",
          }}
        >
          {placeholder}
        </Text>
      </Flex>

      {!isEmpty(helperText) ||
        (!isEmpty(errors[`${id}`]) && (
          <Flex
            gap="4"
            align="center"
            css={{
              mt: "$8",
              "& svg": {
                height: "$16 !important",
                width: "$16 !important",
                color: "$dangerBase",
              },
            }}
          >
            {state === "error" && <InfoIcon />}
            {/* {state === "error" && <img src="/icons/info.svg" alt="info" />} */}
            <Text
              css={{
                color: state === "error" ? "$dangerBase" : "$primary300",
              }}
              hint
            >
              {!isEmpty(helperText) ? helperText : errors[`${id}`]?.message}
            </Text>
          </Flex>
        ))}
    </Flex>
  );
};

export default Input;
