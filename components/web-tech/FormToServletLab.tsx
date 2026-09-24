"use client";

import type { ReactNode } from "react";
import { Lab, Presets, SegmentRow, useExplorationState } from "@/components/learning/Controls";

type Method = "get" | "post";
type Impl = "doGet" | "doPost" | "both";
type Attr = "name" | "Name";

const defaults = { method: "post" as Method, impl: "doGet" as Impl, attr: "name" as Attr, user: "ali", pass: "123" };
type S = typeof defaults;

const presets: { label: string; values: Partial<S> }[] = [
  { label: "slide 55: blank page?", values: { method: "post", impl: "doGet", attr: "name" } },
  { label: "slide 59: fixed", values: { method: "post", impl: "doPost", attr: "name" } },
  { label: "slide 48: name ≠ Name", values: { method: "get", impl: "doGet", attr: "Name" } },
  { label: "GET form", values: { method: "get", impl: "both", attr: "name" } },
];

function Panel({ title, children, tone }: { title: string; children: ReactNode; tone?: "red" | "green" | "amber" }) {
  const border = tone === "red" ? "border-red-700/50" : tone === "green" ? "border-green-700/40" : tone === "amber" ? "border-amber-700/40" : "border-gray-400";
  return (
    <div className={`min-w-0 rounded-md border ${border} bg-background-100`}>
      <p className="text-label-12 border-b border-gray-400 px-3 py-1.5 text-gray-700">{title}</p>
      <pre className="m-0 overflow-x-auto rounded-none border-0 bg-transparent px-3 py-2 font-mono text-[12px] leading-[1.6] whitespace-pre text-gray-1000">{children}</pre>
    </div>
  );
}

/** Explorable: an HTML form posting to HelloServlet. Change the form's method, which doX the servlet overrides, and the input's name attribute. */
export function FormToServletLab() {
  const { values: v, set, reset, apply } = useExplorationState(defaults);
  const method = v.method as Method;
  const impl = v.impl as Impl;
  const attr = v.attr as Attr;

  const body = new URLSearchParams([
    [attr, v.user],
    ["password", v.pass],
  ]).toString();
  const path = "/demo/hello-servlet";
  const target = method === "get" ? `${path}?${body}` : path;

  const request =
    method === "get"
      ? `GET ${target} HTTP/1.1\nHost: localhost:8080\nReferer: http://localhost:8080/demo/index.html\n\n(no body)`
      : `POST ${target} HTTP/1.1\nHost: localhost:8080\nContent-Type: application/x-www-form-urlencoded\nContent-Length: ${new TextEncoder().encode(body).length}\n\n${body}`;

  const handler = method === "get" ? "doGet" : "doPost";
  const implemented = impl === "both" || impl === handler;
  const nameValue = attr === "name" ? v.user : null;

  let status: string;
  let resp: string;
  let tone: "red" | "green" | "amber";
  let verdict: string;
  if (!implemented) {
    status = "HTTP/1.1 405";
    resp = `HTTP/1.1 405\nContent-Type: text/html;charset=utf-8\n\nHTTP Status 405 – Method Not Allowed\nHTTP method ${method.toUpperCase()} is not supported by this URL`;
    tone = "red";
    verdict = `The browser sent ${method.toUpperCase()}. HttpServlet.service() dispatched to ${handler}(), which you did not override, so the inherited version answered 405. Your code never ran. On the slides this looks like "the server shows nothing"; open DevTools → Network and the 405 is right there.`;
  } else {
    status = "HTTP/1.1 200";
    resp = `HTTP/1.1 200\nContent-Type: text/html;charset=UTF-8\n\n<html><body>\n<h1>${nameValue ?? "null"}</h1>\n<h3> this is your password${v.pass}</h3>`;
    tone = nameValue === null ? "amber" : "green";
    verdict =
      nameValue === null
        ? `The servlet asked for "name" but the form sent "Name". getParameter is case-sensitive and returns null for a missing parameter. String concatenation turns null into the four letters "null"; there is no NullPointerException unless you call a method on it, such as name.length().`
        : `${handler}() ran. getParameter("name") found the value in the ${method === "get" ? "query string" : "request body"}: the same call works for both, because the container parses either one.`;
  }

  const addressBar = `http://localhost:8080${target}`;

  return (
    <Lab
      title="Form → HTTP → servlet"
      subtitle="index.html holds the form, HelloServlet is mapped to /hello-servlet. Change one thing at a time."
      onReset={reset}
      controls={
        <>
          <Presets presets={presets} onPick={apply} />
          <SegmentRow<Method>
            label='form method="…"'
            value={method}
            options={[
              { value: "get", label: "get" },
              { value: "post", label: "post" },
            ]}
            onChange={(x) => set("method", x)}
          />
          <SegmentRow<Impl>
            label="HelloServlet overrides"
            value={impl}
            options={[
              { value: "doGet", label: "doGet" },
              { value: "doPost", label: "doPost" },
              { value: "both", label: "both" },
            ]}
            onChange={(x) => set("impl", x)}
          />
          <SegmentRow<Attr>
            label='first input name="…"'
            value={attr}
            options={[
              { value: "name", label: "name" },
              { value: "Name", label: "Name" },
            ]}
            onChange={(x) => set("attr", x)}
          />
          <div className="grid grid-cols-2 gap-2">
            <label className="text-label-12 space-y-1 text-gray-800">
              <span>typed name</span>
              <input
                value={v.user}
                onChange={(e) => set("user", e.target.value)}
                className="w-full rounded-md border border-gray-500 bg-background-100 px-2 py-1 font-mono text-[12px] text-gray-1000 outline-none focus:border-blue-700"
              />
            </label>
            <label className="text-label-12 space-y-1 text-gray-800">
              <span>typed password</span>
              <input
                value={v.pass}
                onChange={(e) => set("pass", e.target.value)}
                className="w-full rounded-md border border-gray-500 bg-background-100 px-2 py-1 font-mono text-[12px] text-gray-1000 outline-none focus:border-blue-700"
              />
            </label>
          </div>
        </>
      }
    >
      <div className="grid gap-3">
        <Panel title="index.html (the form)">
          {`<form method="${method}" action="hello-servlet">\n  <input type="text" name="${attr}">\n  <input type="password" name="password">\n  <input type="submit">\n</form>`}
        </Panel>
        <div className="rounded-md border border-gray-400 bg-background-100 px-3 py-2">
          <p className="text-label-12 text-gray-700">Address bar after submit</p>
          <p className={`mt-0.5 overflow-x-auto font-mono text-[12px] whitespace-nowrap ${method === "get" ? "text-amber-600" : "text-gray-1000"}`}>{addressBar}</p>
          {method === "get" && <p className="text-copy-13 mt-1 text-amber-600">The password is now in the URL: browser history, server access logs, and any proxy in between.</p>}
        </div>
        <div className="grid gap-3">
          <Panel title="on the wire: request">{request}</Panel>
          <Panel title={`on the wire: response · ${status.replace("HTTP/1.1 ", "")}`} tone={tone}>
            {resp}
          </Panel>
        </div>
        <p className={`text-copy-14 ${tone === "red" ? "text-red-600" : tone === "amber" ? "text-amber-600" : "text-green-600"}`}>{verdict}</p>
      </div>
    </Lab>
  );
}
