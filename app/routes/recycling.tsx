import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { getUser } from "~/session.server";

export const meta: MetaFunction = () => {
  return [{
    title: "Recycling",
    description: "Manage recycling for students",
  }];
};

export async function loader({ request }: LoaderFunctionArgs) {

  const user = await getUser(request);
  return { user };
}

export default function Recycling() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Recycling Page</h1>
      <p>This is where you will manage recycling for students.</p>
    </div>
  );
}