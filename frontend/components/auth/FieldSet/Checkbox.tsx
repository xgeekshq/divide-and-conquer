import TextField from "../../Primitives/TextField";
import { FormCompoundFieldSetType } from "../../../types/compoundFieldSet";
import Label from "../../Primitives/Label";
import { UserYup } from "../../../types/user";
import Flex from "../../Primitives/Flex";

const FormCheckbox: React.FC<FormCompoundFieldSetType> = ({ label, id, register }) => {
  return (
    <Flex wrap="noWrap" align="center">
      <TextField id={id} type="checkbox" {...register(id as UserYup)} css={{ mr: "$10" }} />
      <Label htmlFor={id} size="14">
        {label}
      </Label>
    </Flex>
  );
};

export default FormCheckbox;
