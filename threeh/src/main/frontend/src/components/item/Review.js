import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '../../css/reviewPageCss/review.css'; 

const Review = ({ itemId, isAdmin }) => {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [reviewScore, setReviewScore] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const getLoginUser = () => {
    try {
      return JSON.parse(sessionStorage.getItem("user"));
    } catch (error) {
      console.error("user 파싱 실패", error);
      sessionStorage.removeItem("user");
      return null;
    }
  };

  const user = getLoginUser();

  useEffect(() => {
    if (!itemId) {
      return;
    }
    getReviews();
    getReviewSummary();
  }, [itemId]);

  const getReviews = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/reviews/item/${itemId}`,
        {
          withCredentials: true,
        }
      );

      console.log("리뷰 목록:", response.data);
      setReviews(response.data);
    } catch (error) {
      console.error("리뷰 조회 실패", error);

      if (error.response) {
        console.log("리뷰 조회 상태코드:", error.response.status);
        console.log("리뷰 조회 응답:", error.response.data);
      }

      toast.error("리뷰 목록을 불러오지 못했습니다.");
    }
  };

  const getReviewSummary = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/reviews/summary/${itemId}`,
        {
          withCredentials: true,
        }
      );

      console.log("리뷰 평점 요약:", response.data);
      setReviewSummary(response.data);
    } catch (error) {
      console.error("리뷰 평점 조회 실패", error);

      if (error.response) {
        console.log("리뷰 평점 상태코드:", error.response.status);
        console.log("리뷰 평점 응답:", error.response.data);
      }

      toast.error("리뷰 평점 정보를 불러오지 못했습니다.");
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("로그인이 필요합니다.");

      setTimeout(() => {
        navigate("/login");
      }, 800);

      return;
    }

    if (isAdmin) {
      toast.warning("관리자는 리뷰를 작성할 수 없습니다.");
      return;
    }

    if (!reviewScore || reviewScore < 1 || reviewScore > 5) {
      toast.warning("별점은 1점 이상 5점 이하로 선택해주세요.");
      return;
    }

    if (!reviewText.trim()) {
      toast.warning("리뷰 내용을 입력해주세요.");
      return;
    }

    if (reviewText.length > 255) {
      toast.warning("리뷰 내용은 255자를 초과할 수 없습니다.");
      return;
    }

    try {
      await axios.post(
        `http://localhost:8080/api/reviews/${itemId}`,
        {
          reviewScore: reviewScore,
          reviewText: reviewText,
        },
        {
          withCredentials: true,
        }
      );

      toast.success("리뷰가 등록되었습니다.");

      setReviewScore(5);
      setReviewText("");

      getReviews();
      getReviewSummary();
    } catch (error) {
      console.error("리뷰 등록 실패", error);

      if (error.response) {
        console.log("리뷰 등록 상태코드:", error.response.status);
        console.log("리뷰 등록 응답:", error.response.data);

        if (error.response.status === 401 || error.response.status === 403) {
          toast.error("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
          sessionStorage.removeItem("user");

          setTimeout(() => {
            navigate("/login");
          }, 1000);

          return;
        }

        toast.error(
          error.response?.data?.message ||
          error.response?.data ||
          "리뷰 등록 실패"
        );
        return;
      }

      toast.error("리뷰 등록 실패");
    }
  };

  const handleAdminDeleteReview = async (reviewId) => {
    const confirmDelete = window.confirm("이 리뷰를 삭제하시겠습니까?");

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:8080/api/reviews/admin/${reviewId}`,
        {
          withCredentials: true,
        }
      );

      toast.success("리뷰가 삭제되었습니다.");

      getReviews();
      getReviewSummary();
    } catch (error) {
      console.error("관리자 리뷰 삭제 실패", error);

      if (error.response) {
        console.log("리뷰 삭제 상태코드:", error.response.status);
        console.log("리뷰 삭제 응답:", error.response.data);

        if (error.response.status === 401 || error.response.status === 403) {
          toast.error("관리자 로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
          sessionStorage.removeItem("user");

          setTimeout(() => {
            navigate("/login");
          }, 1000);

          return;
        }

        toast.error(
          error.response?.data?.message ||
          error.response?.data ||
          "리뷰 삭제 실패"
        );
        return;
      }

      toast.error("리뷰 삭제 실패");
    }
  };

  const renderStars = (score) => {
    const safeScore = Math.max(0, Math.min(5, Number(score || 0)));
    const full = "★".repeat(safeScore);
    const empty = "☆".repeat(5 - safeScore);

    return full + empty;
  };

  return (
    <div
      style={{
        marginTop: "40px",
        borderTop: "1px solid #ddd",
        paddingTop: "30px",
      }}
    >
      <ToastContainer
        position="top-center"
        autoClose={1800}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        theme="light"
      />

      <h2>{isAdmin ? "상품 리뷰 관리" : "상품 리뷰"}</h2>

      {reviewSummary && (
        <div style={{ marginBottom: "20px" }}>
          <p>
            평균 평점: {Number(reviewSummary.averageScore || 0).toFixed(1)} / 5
          </p>
          <p>리뷰 수: {reviewSummary.reviewCount || 0}</p>
        </div>
      )}

      {user && !isAdmin && (
        <div style={{ marginBottom: "30px" }}>
          <h3>리뷰 작성</h3>

          <div>
            <label>별점: </label>
            <select
              value={reviewScore}
              onChange={(e) => setReviewScore(Number(e.target.value))}
            >
              <option value={5}>★★★★★ 5점</option>
              <option value={4}>★★★★☆ 4점</option>
              <option value={3}>★★★☆☆ 3점</option>
              <option value={2}>★★☆☆☆ 2점</option>
              <option value={1}>★☆☆☆☆ 1점</option>
            </select>
          </div>

          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="상품 리뷰를 작성해주세요. 구매한 상품만 리뷰 작성이 가능합니다."
            rows={5}
            maxLength={255}
            style={{
              width: "100%",
              marginTop: "10px",
              padding: "10px",
            }}
          />

          <p>{reviewText.length} / 255</p>

          <button type="button" onClick={handleSubmitReview}>
            리뷰 등록
          </button>
        </div>
      )}

      <div>
        {reviews.length === 0 ? (
          <p>아직 작성된 리뷰가 없습니다.</p>
        ) : (
          reviews.map((review) => (
            <div
              key={review.reviewId}
              style={{
                borderBottom: "1px solid #ddd",
                padding: "15px 0",
              }}
            >
              <strong>
                {review.memberName || review.memberLoginId || "회원"}
              </strong>

              <p style={{ color: "#f5a623", fontSize: "20px" }}>
                {renderStars(review.reviewScore)}
              </p>

              <p>{review.reviewText}</p>

              <small>
                작성일:{" "}
                {review.createdAt
                  ? String(review.createdAt).substring(0, 10)
                  : ""}
              </small>

              {isAdmin && (
                <div style={{ marginTop: "10px" }}>
                  <button
                    type="button"
                    onClick={() => handleAdminDeleteReview(review.reviewId)}
                    style={{
                      backgroundColor: "#333",
                      color: "#fff",
                      border: "none",
                      padding: "6px 12px",
                      cursor: "pointer",
                    }}
                  >
                    리뷰 삭제
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Review;