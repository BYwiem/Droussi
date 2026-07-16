import { PricingPage } from "../../components/droussi/PricingPage";
import { useMe } from "../../hooks/useMe";

export default function PricingRoute() {
  const { me, loading } = useMe();
  const plan = me?.plan === "pro" ? "pro" : "free";
  return <PricingPage plan={plan} loading={loading} />;
}
