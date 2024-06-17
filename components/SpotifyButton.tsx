export default function SpotifyButton({ handleSignIn }: any) {
  return (
    <button
      formAction={handleSignIn}
      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
    >
      Connect Spotify
    </button>
  );
}
