import React, { useMemo, useState } from "react";
import axios from "axios";
import { useMatch } from "react-router-dom";
import "../../css/itemPageCss/articlePage.css";

const ArticlePage = () => {
  // 지금 페이지가 상품 상세 페이지인지 확인하려고 쓰는거.
  // /item/:itemId 페이지면 상품 문의로 저장하고,
  // 그 외 페이지면 일반 상담 문의로 저장할거임.
  const itemDetailMatch = useMatch("/item/:itemId");

  // 상담창 열고 닫는 상태
  const [articlePageOpen, setArticlePageOpen] = useState(false);

  // 사용자가 입력하는 상담 내용
  const [articlePageContent, setArticlePageContent] = useState("");

  // 비회원일 때 이름, 연락처 받을거임.
  const [articlePageGuestName, setArticlePageGuestName] = useState("");
  const [articlePageGuestPhone, setArticlePageGuestPhone] = useState("");

  // 로그인 회원의 상담 내역 목록
  const [articlePageList, setArticlePageList] = useState([]);

  // sessionStorage에 저장된 로그인 유저 정보 가져오기
  // 일반 로그인/소셜 로그인 둘 다 sessionStorage user 기준으로 볼거임.
  const articlePageUser = useMemo(() => {
    try {
      const savedUser = sessionStorage.getItem("user");

      if (!savedUser) {
        return null;
      }

      const parsedUser = JSON.parse(savedUser);

      // 세션 만료 시간이 있으면 만료 체크
      if (parsedUser.expiry && parsedUser.expiry < new Date().getTime()) {
        sessionStorage.removeItem("user");
        return null;
      }

      return parsedUser;
    } catch (error) {
      console.error("회원 정보 파싱 실패:", error);
      sessionStorage.removeItem("user");
      return null;
    }
  }, [articlePageOpen]);

  // 로그인 여부
  const articlePageIsLogin = !!articlePageUser;

  //관리자면 상담창 가리게, 관리자 여부확인
  const articlePageIsAdmin = articlePageIsLogin && articlePageUser.role ==="ADMIN"&&
  !!articlePageUser.adminId;

  // 회원번호 찾기.
  // 프로젝트마다 memberId 이름이 다를 수 있어서 여러 후보를 같이 확인함.
  const articlePageMemberId = articlePageIsLogin
    ? Number(
        articlePageUser.memberId ||
          articlePageUser.member_id ||
          articlePageUser.memberNo ||
          articlePageUser.userId ||
          articlePageUser.id
      )
    : null;

  // 상품 상세 페이지면 itemId 저장.
  // 일반 페이지 상담이면 null로 저장.
  const articlePageItemId = itemDetailMatch?.params?.itemId
    ? Number(itemDetailMatch.params.itemId)
    : null;

  // 내 상담 목록 조회
  const getMyArticles = async () => {
    if (!articlePageMemberId) {
      console.log("회원번호가 없습니다. sessionStorage user:", articlePageUser);
      setArticlePageList([]);
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:8080/api/articles/member/${articlePageMemberId}`,
        {
          withCredentials: true,
        }
      );

      console.log("내 상담 목록 응답:", res.data);

      // 백엔드에서 최신순으로 내려오면 채팅창에서는 최신 글이 아래로 와야 하니까 뒤집어줌.
      const sortedArticles = [...(res.data || [])].reverse();

      setArticlePageList(sortedArticles);
    } catch (error) {
      console.error("내 상담 목록 조회 실패:", error);
    }
  };

  // 상담창 열기
  const handleOpenArticlePage = async () => {
    setArticlePageOpen(true);

    // 로그인 회원이면 상담창 열 때 내 상담 내역도 바로 불러오기
    if (!articlePageMemberId) {
      console.log("회원번호가 없습니다. sessionStorage user:", articlePageUser);
      setArticlePageList([]);
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:8080/api/articles/member/${articlePageMemberId}`,
        {
          withCredentials: true,
        }
      );

      console.log("내 상담 목록 응답:", res.data);

      // 오래된 상담이 위, 최신 상담이 아래로 보이게 뒤집기
      const sortedArticles = [...(res.data || [])].reverse();

      setArticlePageList(sortedArticles);
    } catch (error) {
      console.error("내 상담 목록 조회 실패:", error);
    }
  };

  // 상담 문의 등록
  const articlePageSubmit = async () => {
    if (!articlePageContent.trim()) {
      alert("상담 내용을 입력해주세요.");
      return;
    }

    // 비회원이면 이름이랑 연락처 꼭 받기
    if (!articlePageIsLogin) {
      if (!articlePageGuestName.trim()) {
        alert("비회원 이름을 입력해주세요.");
        return;
      }

      if (!articlePageGuestPhone.trim()) {
        alert("비회원 연락처를 입력해주세요.");
        return;
      }
    }

    // 비회원은 따로 컬럼이 없으니까 이름/연락처를 상담 내용 앞에 같이 저장함.
    const articlePageFinalContent = articlePageIsLogin
      ? articlePageContent
      : `[비회원 문의]
      이름: ${articlePageGuestName}
      연락처: ${articlePageGuestPhone}

      문의내용:
      ${articlePageContent}`;

    try {
      await axios.post(
        "http://localhost:8080/api/articles",
        {
          memberId: articlePageMemberId,
          itemId: articlePageItemId,
          articleTitle: articlePageItemId
            ? "상품 상담 문의"
            : "일반 상담 문의",
          articleContent: articlePageFinalContent,
        },
        {
          withCredentials: true,
        }
      );

      alert("상담 문의가 등록되었습니다.");

      // 입력창 비우기
      setArticlePageContent("");
      setArticlePageGuestName("");
      setArticlePageGuestPhone("");

      // 로그인 회원이면 등록 후 내 상담 내역 다시 불러오기
      if (articlePageMemberId) {
        await getMyArticles();
      }
    } catch (error) {
      console.error("상담 문의 등록 실패:", error);
      alert("상담 문의 등록에 실패했습니다.");
    }
  };

  // 회원 상담 문의 전체 비우기
  // 이건 화면에서만 지우는 게 아니라 DB에서 삭제하는거라 관리자 페이지에서도 사라짐.
  const handleClearMyArticles = async () => {
    if (!articlePageMemberId) {
      alert("회원 정보가 없어 상담 내역을 삭제할 수 없습니다.");
      return;
    }

    if (articlePageList.length === 0) {
      alert("삭제할 상담 내역이 없습니다.");
      return;
    }

    const confirmClear = window.confirm(
      "내 상담 내역을 모두 삭제하시겠습니까?\n삭제하면 관리자 페이지에서도 해당 문의가 사라지고 복구할 수 없습니다."
    );

    if (!confirmClear) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:8080/api/articles/member/${articlePageMemberId}`,
        {
          withCredentials: true,
        }
      );

      alert("상담 내역이 모두 삭제되었습니다.");

      // 화면에서도 바로 비워주기
      setArticlePageList([]);
    } catch (error) {
      console.error("상담 내역 전체 삭제 실패:", error);
      alert("상담 내역 삭제에 실패했습니다.");
    }
  };

  //관리자로 로그인한 경우 상담창을 노출하지 않기.
  if(articlePageIsAdmin){return null;}


  return (
    <>
      {/* 모든 페이지 오른쪽 아래에 떠있는 상담 버튼 */}
      <button className="articlePage-button" onClick={handleOpenArticlePage}>
        상담하기
      </button>

      {articlePageOpen && (
        <div className="articlePage-box">
          <div className="articlePage-header">
            <h3 className="articlePage-title">실시간 상담</h3>

            <button
              className="articlePage-closeButton"
              onClick={() => setArticlePageOpen(false)}
            >
              X
            </button>
          </div>

          <div className="articlePage-messageArea">
            {/* 처음 안내 메시지 */}
            <div className="articlePage-adminMessage">
              안녕하세요 😊
              <br />
              궁금한 내용을 남겨주시면 관리자가 확인 후 답변드립니다.
            </div>

            {/* 로그인 회원이면 회원 정보 보여주기 */}
            {articlePageIsLogin ? (
              <div className="articlePage-userInfo">
                {articlePageUser.name || articlePageUser.id}님으로 문의합니다.
                <br />
                회원번호: {articlePageMemberId || "없음"}
              </div>
            ) : (
              <>
                {/* 비회원이면 이름/연락처 받기 */}
                <div className="articlePage-pageInfo">
                  비회원 문의는 등록 가능하지만, 답변 확인은 연락처로 안내됩니다.
                </div>

                <div className="articlePage-guestBox">
                  <input
                    className="articlePage-guestInput"
                    type="text"
                    value={articlePageGuestName}
                    onChange={(e) => setArticlePageGuestName(e.target.value)}
                    placeholder="비회원 이름"
                  />

                  <input
                    className="articlePage-guestInput"
                    type="text"
                    value={articlePageGuestPhone}
                    onChange={(e) => setArticlePageGuestPhone(e.target.value)}
                    placeholder="연락처"
                  />
                </div>
              </>
            )}

            {/* 상품 상세 페이지인지 일반 페이지인지 알려주기 */}
            {articlePageItemId ? (
              <div className="articlePage-pageInfo">
                현재 상품에 대한 문의로 등록됩니다.
              </div>
            ) : (
              <div className="articlePage-pageInfo">
                일반 상담 문의로 등록됩니다.
              </div>
            )}

            {/* 로그인 회원이면 내 상담 내역 보여주기 */}
            {articlePageIsLogin && (
              <div className="articlePage-historyArea">
                <div className="articlePage-historyHeader">
                  <p className="articlePage-historyTitle">내 상담 내역</p>

                  <div className="articlePage-historyActions">
                    <button
                      type="button"
                      className="articlePage-refreshButton"
                      onClick={getMyArticles}
                    >
                      새로고침
                    </button>

                    <button
                      type="button"
                      className="articlePage-clearButton"
                      onClick={handleClearMyArticles}
                      disabled={articlePageList.length === 0}
                    >
                      내역 비우기
                    </button>
                  </div>
                </div>

                {articlePageList.length === 0 ? (
                  <div className="articlePage-pageInfo">
                    아직 등록한 상담 문의가 없습니다.
                  </div>
                ) : (
                  articlePageList.map((article) => (
                    <div
                      className="articlePage-historyItem"
                      key={article.articleId}
                    >
                      <div className="articlePage-historyItemHeader">
                        <span className="articlePage-statusText">
                          {article.articleStatus === "ANSWERED"
                            ? "답변완료"
                            : "답변대기"}
                        </span>
                      </div>

                      {/* 내가 남긴 상담 내용 */}
                      <div className="articlePage-userMessage">
                        {article.articleContent || "문의 내용이 없습니다."}
                      </div>

                      {/* 관리자 답변 있으면 보여주고, 없으면 대기중 표시 */}
                      {article.articleAnswer ? (
                        <div className="articlePage-adminMessage">
                          <strong>관리자 답변</strong>
                          <br />
                          {article.articleAnswer}
                        </div>
                      ) : (
                        <div className="articlePage-pageInfo">
                          관리자 답변 대기중입니다.
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 상담 내용 입력창 */}
          <textarea
            className="articlePage-textarea"
            value={articlePageContent}
            onChange={(e) => setArticlePageContent(e.target.value)}
            placeholder="상담 내용을 입력하세요"
          />

          {/* 상담 보내기 버튼 */}
          <button className="articlePage-submitButton" onClick={articlePageSubmit}>
            보내기
          </button>
        </div>
      )}
    </>
  );
};

export default ArticlePage;