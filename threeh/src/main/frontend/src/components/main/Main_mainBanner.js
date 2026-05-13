import React from 'react';

const Main_mainBanner = () => {
    return (
        <div className="banners">
            <section className="mainBanner">
                <ul className="slide">
                    <li className="s1"> <a href="#">배너1</a> </li>
                    <li className="s2"> <a href="#">배너2</a> </li>
                    <li className="s3"> <a href="#">배너3</a> </li>
                </ul>
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
        </div>
    );
};

export default Main_mainBanner;