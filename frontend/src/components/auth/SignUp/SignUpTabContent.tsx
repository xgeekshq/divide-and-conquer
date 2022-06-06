import React, { Dispatch, useState } from 'react';

import { TabsContent } from 'components/Primitives/Tab';
import { SignUpEnum } from 'utils/signUp.enum';
import RegisterForm from './RegisterForm';
import SignUpForm from './SignUpForm';
import SignUpOptionsForm from './SignUpOptionsForm';

interface SignUpTabContentProps {
	setCurrentTab: Dispatch<React.SetStateAction<string>>;
}

const SignUpTabContent: React.FC<SignUpTabContentProps> = ({ setCurrentTab }) => {
	const [showSignUp, setShowSignUp] = useState(SignUpEnum.SIGN_UP);
	const [emailName, setEmailName] = useState({ email: '', goback: false });
	const conditionalRendering = () => {
		if (showSignUp === SignUpEnum.SIGN_UP)
			return (
				<SignUpForm
					setShowSignUp={setShowSignUp}
					setEmailName={setEmailName}
					emailName={emailName}
				/>
			);
		if (showSignUp === SignUpEnum.SIGN_UP_OPTIONS)
			return (
				<SignUpOptionsForm
					setShowSignUp={setShowSignUp}
					setEmailName={setEmailName}
					emailName={emailName.email}
				/>
			);
		return (
			<RegisterForm
				emailName={emailName}
				setShowSignUp={setShowSignUp}
				setCurrentTab={setCurrentTab}
				setEmailName={setEmailName}
			/>
		);
	};

	return <TabsContent value="register">{conditionalRendering()}</TabsContent>;
};

export default SignUpTabContent;
