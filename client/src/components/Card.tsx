export default function Card({ _id, title, description }: { _id: string; title: string; description?: string }) {
    return (
        <div
            key={_id}
            className="bg-white rounded p-3 border border-gray-200 shadow-sm hover:shadow cursor-pointer hover:bg-gray-50 transition duration-200 ease-in-out"
        >
            <h4 className="font-medium text-gray-700">{title}</h4>
            {description && (
                <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
        </div>
    );
}