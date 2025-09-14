export const TaskType = {
  VISIT_WEBSITE: "VISIT_WEBSITE",
  FOLLOW_SOCIAL: "FOLLOW_SOCIAL",
  WATCH_YOUTUBE: "WATCH_YOUTUBE",
  JOIN_TELEGRAM_CHANNEL: "JOIN_TELEGRAM_CHANNEL",
  BOOST_TELEGRAM_CHANNEL: "BOOST_TELEGRAM_CHANNEL",
  POST_TELEGRAM_STORY: "POST_TELEGRAM_STORY",
  ADD_LOGO_TO_PROFILE_NAME: "ADD_LOGO_TO_PROFILE_NAME",
  CONNECT_WALLET: "CONNECT_WALLET",
  ON_CHAIN_TRANSACTION: "ON_CHAIN_TRANSACTION",
  ADD_TOKEN_TO_WALLET: "ADD_TOKEN_TO_WALLET",
} as const;
export type TaskType = (typeof TaskType)[keyof typeof TaskType];

const TaskIcons: Record<TaskType, string> = {
  VISIT_WEBSITE: "/tasks/website.png",
  FOLLOW_SOCIAL: "/tasks/instagram.png",
  WATCH_YOUTUBE: "/tasks/youtube.png",
  JOIN_TELEGRAM_CHANNEL: "/tasks/telegram.png",
  BOOST_TELEGRAM_CHANNEL: "/tasks/boost-telegram.png",
  POST_TELEGRAM_STORY: "/tasks/story.png",
  ADD_LOGO_TO_PROFILE_NAME: "/tasks/website.png",
  CONNECT_WALLET: "/tasks/connect-wallet.png",
  ON_CHAIN_TRANSACTION: "/tasks/transaction.png",
  ADD_TOKEN_TO_WALLET: "/tasks/add-token-wallet.png",
};

export const getTaskIconUrl = (task: any) => {
  if (task.type != TaskType.FOLLOW_SOCIAL && TaskIcons[task.type as TaskType]) {
    return TaskIcons[task.type as TaskType];
  }
  try {
    const hostname = new URL(task.metadata.url).hostname.toLowerCase();

    if (hostname.includes("instagram.com")) {
      return "/tasks/instagram.png";
    }

    if (hostname.includes("x.com") || hostname.includes("twitter.com")) {
      return "/tasks/twitter.png";
    }

    return "/tasks/social.png";
  } catch (e) {
    return "/tasks/social.png";
  }
};


export const fallbackCopy = (text: string) => {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
};


export const openWalletAddAsset = async (metadata: any): Promise<void> => {
       const tokenAddress = metadata.tokenAddress;
        // const tokenSymbol = task.metadata.tokenSymbol;
        // const tokenDecimals = task.metadata.tokenDecimals;
        // const tokenImage = task.metadata.tokenImage;

if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(tokenAddress);
      } else {
        fallbackCopy(tokenAddress);
      }

      window.open(
        `https://link.trustwallet.com/add_asset?asset=c56_t${tokenAddress}`,
        "_blank"
      );
}