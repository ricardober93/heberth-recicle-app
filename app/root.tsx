import {
  Form,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { getUser } from "~/session.server";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];


export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  return { user };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <Layout>
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-white text-lg font-semibold">Recicly</Link>
          <ul className="flex space-x-4">
            <li><Link to="/students" className="text-gray-300 hover:text-white">Students</Link></li>
            <li><Link to="/classrooms" className="text-gray-300 hover:text-white">Classrooms</Link></li>
            <li><Link to="/recycling" className="text-gray-300 hover:text-white">Recycling</Link></li>
            {user ? (
              <li>
                <Form action="/logout" method="post">
                  <button type="submit" className="text-gray-300 hover:text-white">Logout</button>
                </Form>
              </li>
            ) : (
              <li><Link to="/login" className="text-gray-300 hover:text-white">Login</Link></li>
            )}
          </ul>
        </div>
      </nav>
      <div className="container mx-auto p-4">
        <Outlet />
      </div>
    </Layout>
  );
}
    