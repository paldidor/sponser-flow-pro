import LandingPage from "@/components/LandingPage";

const Index = () => {
  return <LandingPage onGetStarted={() => window.location.href = '/auth'} />;
};

export default Index;
