import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { User_Referral_Link } from "../constants";
import { Api_FetchFriends } from "../api";

interface Friend {
  id: number;
  firstName: string;
  username?: string;
}

const FriendsPage = () => {
  const { token, telegramUser } = useAppContext();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!token) return;
      try {
        const response = await Api_FetchFriends(token);
        setFriends(response);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, [token]);

  const copyLink = () => {
    navigator.clipboard.writeText(User_Referral_Link(telegramUser?.id ?? -1));
    alert("Referral link copied!"); // یا یک نوتیفیکیشن بهتر نشون بده
  };

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold text-center mb-4">Invite Friends</h1>

      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <p className="text-gray-400 mb-2">Your personal referral link:</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={User_Referral_Link(telegramUser?.id ?? -1)}
            className="w-full bg-gray-700 p-2 rounded border-none text-gray-300"
          />
          <button onClick={copyLink} className="bg-yellow-500 p-2 rounded">
            Copy
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-2">
        Your Friends ({friends.length})
      </h2>
      {loading ? (
        <p>Loading friends...</p>
      ) : (
        <ul className="bg-gray-800 p-2 rounded-lg">
          {friends.length > 0 ? (
            friends.map((friend) => (
              <li
                key={friend.id}
                className="flex items-center p-2 border-b border-gray-700 last:border-b-0"
              >
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center font-bold mr-3">
                  {friend.firstName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{friend.firstName}</p>
                  <p className="text-xs text-gray-400">
                    @{friend.username || "no_username"}
                  </p>
                </div>
              </li>
            ))
          ) : (
            <p className="text-center p-4 text-gray-500">
              You haven't invited any friends yet.
            </p>
          )}
        </ul>
      )}
    </div>
  );
};

export default FriendsPage;
