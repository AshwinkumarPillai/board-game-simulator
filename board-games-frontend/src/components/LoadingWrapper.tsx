"use client";

import LoadingSpinner from "./LoadingSpinner";

export default function LoadingWrapper() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <div className="text-center">
        <strong className="text-yellow-400">We are connecting to the server ...</strong>
        <br />
        Since the server is hosted on a free site - it spins down after 15 mins of inactivity
        <br />
        <br />
        <hr />
        <br />
        (Thanks to the crypto bros for ruining free server hosting)
        <br />
        This could take <strong className="text-green-500">30-50 seconds</strong> and{" "}
        <strong className="text-red-500">only happens once</strong>
        <br /> <br />
        <hr />
        <br />
        <div>
          If it has been more than a minute, please click{" "}
          <button
            type="button"
            className="text-blue-500 cursor-pointer"
            onClick={() => window.location.reload()}
          >
            Here
          </button>
        </div>
      </div>
      <br />
      <div>
        <LoadingSpinner />
      </div>
    </div>
  );
}
