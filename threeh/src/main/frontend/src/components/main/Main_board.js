import React from 'react';

const Main_board = () => {
    return (
        <section className="board">
            <article className="articles">
                <div>
                    <div>
                        게시판 이미지
                    </div>
                    <p>@사용자id</p>
                </div>

                <div>
                    <div>
                        게시판 이미지
                    </div>
                    <p>@사용자id</p>
                </div>

                <div>
                    <div>
                        게시판 이미지
                    </div>
                    <p>@사용자id</p>
                </div>

                <div>
                    <div>
                        게시판 이미지
                    </div>
                    <p>@사용자id</p>
                </div>
            </article>
            <div className="btnOnce">
                <button className="prev"> &lt; </button>
                <button className="next"> &gt; </button>
            </div>
            <ul className="btnOrder">
                <li></li>
                <li></li>
                <li></li>
            </ul>
        </section>
    );
};

export default Main_board;