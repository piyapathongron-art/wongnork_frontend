import React from 'react';

const ReviewSection = ({ reviews, formatDate }) => {
    return (
        <section className="space-y-4">
            <h3 className="font-extrabold text-xl text-[#2B361B]">My Reviews</h3>
            <div className="space-y-5">
                {reviews.length === 0 ? (
                    <p className="text-sm text-center text-gray-400 py-4">ยังไม่มีข้อมูลรีวิว</p>
                ) : (
                    reviews.map((review, index) => {
                        const restaurant = review.restaurant || {};
                        const imageUrl =
                            restaurant.images?.find((img) => img.isCover)?.url ||
                            restaurant.images?.[0]?.url ||
                            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80';

                        return (
                            <div key={review.id || index} className="flex gap-4 items-start">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden flex-none bg-[#2D3E25]">
                                    <img alt={restaurant.name} className="w-full h-full object-cover" src={imageUrl} />
                                </div>
                                <div className="space-y-1 w-full">
                                    <div className="flex justify-between items-center w-full">
                                        <h4 className="font-bold text-[13px] text-[#2B361B]">{restaurant.name || 'ร้านอาหาร'}</h4>
                                        <span className="text-[10px] text-[#A8A29F] font-medium">{formatDate(review.createdAt)}</span>
                                    </div>
                                    <div className="flex text-[#A65D2E]">
                                        {[...Array(5)].map((_, starIndex) => (
                                            <svg key={starIndex} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={starIndex < review.rating ? "currentColor" : "none"} stroke={starIndex < review.rating ? "none" : "currentColor"} strokeWidth={2} className="w-3 h-3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="text-[11px] text-[#7A7571] line-clamp-2 leading-relaxed pr-2">
                                        {review.comment}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
};

export default ReviewSection;