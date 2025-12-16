type TopicProps = {
  text: string;
};

export default function TopicCard({ text }: TopicProps) {
  return (
    <div className="mt-6 border rounded-xl p-4 text-center max-w-sm">
      <p className="text-purple-600 font-semibold">
        Topic Suggestion
      </p>
      <p className="mt-2 text-gray-600">
        {text}
      </p>
    </div>
  );
}
