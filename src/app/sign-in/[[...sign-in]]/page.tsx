import { SignIn } from "@clerk/nextjs";


const SignUpPage = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <SignIn />
        </div>
    );
}

export default SignUpPage;