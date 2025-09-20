// THIN WRAPPER -> Use LegalAssistantChat.tsx for real implementation.
// Keeping this file tiny helps detect any unwanted reinjection.
import LegalAssistantChat from './LegalAssistantChat';
export default function AIChat(){
  return <LegalAssistantChat />;
}
// END WRAPPER (ANYTHING BELOW THIS LINE IS CORRUPTION AND WILL BE REMOVED BY INTEGRITY CHECK)
