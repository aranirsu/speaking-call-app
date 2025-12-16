type Props = {
  name: string;
};

export default function UserAvatar({ name }: Props) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
        {name[0]}
      </div>
      <p className="mt-2 font-semibold">{name}</p>
    </div>
  );
}
