import Button from '@components/button/Button';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useCustomAxios from '@hooks/useCustomAxios.mjs';
import { useEffect, useState } from 'react';
import Modal from '@components/Modal';
import Wrapper from '@components/layout/Wrapper';
import SideHeader from '@components/layout/SideHeader';

const OrderStyle = styled.div`
  .section-1{
    color: black;
  }
  .section-2{
    color: black;
  }
  .header {
    font-size: 25px;
    font-weight: 800;
  }
  .section {
    display: flex;
    height: 65px;
  }
  .section-1 {
    font-family: 'NanumSquareRound';
    flex-grow: 1;
    width: 50%;
    cursor: pointer;
    background-color: white;
    border: 1px solid #d8d8d8;
    border-right: none;
    font-size: 20px;
    font-weight: bold;
  }
  .section-1:hover {
    color: #ffa931;
  }
  .section-2 {
    font-family: 'NanumSquareRound';
    flex-grow: 2;
    width: 50%;
    cursor: pointer;
    background-color: white;
    border: 1px solid #d8d8d8;
    font-size: 20px;
    font-weight: bold;
  }
  .section-2:hover {
    color: #ffa931;
  }
  .is_active {
    color: #ffa931;
  }
  .login {
    margin-top: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .unused-list {
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #d8d8d8;
    font-weight: 600;
  }
  .list-item{
    font-size: 1.6rem;
  }
  .qr {
    width: 150px;
    display: block;
    margin: 0 auto;
  }
  .close-button {
    background-color: #ff6666;
    border: unset;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 26px;
    margin-left: auto;
    cursor: pointer;
  }
  .close-button:hover {
    background-color: #ff4444;
  }
  .cross {
    width: 14px;
  }
  .completed-button {
    display: block;
    font-size: 16px;
    padding: 10px;
    font-weight: bold;
    margin: 0 auto;
  }
  .action-button {
    width: 110px;
    height: 60px;
  }
  .empty-section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
    height: 70vh;
  }
  .empty-button {
    margin: 0 auto;
    display: block;
    font-size: 16px;
    padding: 15px 35px;
    font-weight: bold;
  }
  .empty-title {
    font-size: 1.6rem;
    text-align: center;
    line-height: 22px;
    font-weight: 700;
  }
  .empty-subtitle {
    font-family: 'UhBeeSe_hyun';
    font-size: 40px;
    color: #bdbdbd;
  }
`;

const OrderList = () => {
  const navigate = useNavigate();
  const axios = useCustomAxios();
  const [modalOpen, setModalOpen] = useState(false);
  const [section, setSection] = useState(true);
  const [id, setId] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [reviewId, setReviewId] = useState(null);
  const queryClient = useQueryClient();
  const [review, setReview] = useState();

  const { data } = useQuery({
    queryKey: ['orders'],
    queryFn: () => axios.get('/orders'),
    select: response => response.data,
    suspense: true,
  });

  // 사용한 카페 상품 이름 모음
  const usedProducts = data.item
    .filter(item => item.state === 'completed')
    .map(item => item.products)
    .flat()
    .map(product => product.name);

  // 사용한 카페 상품 id 모음
  const usedProductsId = data.item
    .filter(item => item.state === 'completed')
    .map(item => item.products)
    .flat()
    .map(product => product._id);

  // 사용하지 않은 카페 상품 이름 모음
  const unusedProducts = data.item
    .filter(item => item.state !== 'completed')
    .map(item => item.products)
    .flat()
    .map(product => product.name);

  // 사용하지 않은 카페 상품의 id 모음
  const productId = data.item
    .filter(item => item.state !== 'completed')
    .map(item => item._id);

  // 후기 불러오기

  async function getReview() {
    const res = await axios.get(`/replies`);
    setReview(res);
  }

  useEffect(() => {
    getReview();
  }, []);

  const disabledIdList = review?.data.item.map(item => item.product._id) || [];

  const disabled = [];

  disabledIdList.forEach(item => {
    if (usedProductsId.includes(item)) {
      disabled.push(item);
    }
  });

  // 모달
  const closeModal = () => {
    setModalOpen(false);
  };

  const showModal = index => {
    setModalOpen(true);
    setId(productId[index]);
  };

  // 리뷰 페이지로 연결
  const gotoReview = async index => {
    const reviewId = usedProductsId[index];
    await setReviewId(reviewId);
    navigate(`/boards/reviewform/${reviewId}`);
  };

  // 보유, 사용 완료 섹션 선택

  function handleSection1() {
    setSection(true);
  }

  function handleSection2() {
    setSection(false);
  }

  // 사용 완료 버튼을 눌렀을 때 patch

  async function handleState() {
    try {
      await axios.patch(`/orders/${id}`, {
        state: 'completed',
      });
      alert('정상 처리되었습니다.');
      queryClient.invalidateQueries(['orders']);
      closeModal();
    } catch (err) {
      console.error(err);
      alert('다시 시도해 주세요.');
    }
  }

  return (
    <OrderStyle>
      <SideHeader>
        <div className="header">
          <h1>구매 내역</h1>
        </div>
      </SideHeader>
      <Wrapper>
        <div className="section">
          <button
            onClick={handleSection1}
            className={`section-1 ${section ? 'is_active' : ''}`}
          >
            보유
          </button>
          <button
            onClick={handleSection2}
            className={`section-2 ${section ? '' : 'is_active'}`}
          >
            사용 완료
          </button>
        </div>
        <>
          {section ? (
            <div className="unused">
              {unusedProducts.length === 0 ? (
                <div className="empty-section">
                  <span className="empty-subtitle">텅..</span>
                  <h2 className="empty-title">구매 내역이 없습니다.</h2>
                  <Link to="/boards/CafeList">
                    <Button
                      className="empty-button"
                      fontSize="18px"
                      fontWeight="bold"
                    >
                      구매하러 가기
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  {unusedProducts.map((name, index) => (
                    <div key={index}>
                      <div className="unused-list">
                        <p className='list-item'>{name}</p>
                        <Button
                          className="action-button"
                          fontSize="18px"
                          fontWeight="bold"
                          onClick={() => showModal(index)}
                        >
                          QR 보기
                        </Button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          ) : (
            <div className="unused">
              {usedProducts.length === 0 ? (
                <div className="empty-section">
                  <span className="empty-subtitle">텅..</span>
                  <h2 className="empty-title">사용이 완료된 <br/> 쿠폰 내역이 없습니다.</h2>
                </div>
              ) : (
                <>
                  {usedProducts.map((name, index) => (
                    <div key={index} className="unused-list">
                      <p className='list-item'>{name}</p>
                      {disabled.includes(usedProductsId[index]) ? (
                        <Button
                          className="action-button"
                          fontSize="18px"
                          fontWeight="bold"
                          onClick={() => gotoReview(index)}
                          disabled={true}
                        >
                          리뷰 쓰기
                        </Button>
                      ) : (
                        <Button
                          className="action-button"
                          fontSize="18px"
                          fontWeight="bold"
                          onClick={() => gotoReview(index)}
                          disabled={false}
                        >
                          리뷰 쓰기
                        </Button>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </>
        {modalOpen && (
          <Modal className="modal">
            <button className="close-button" onClick={closeModal}>
              <img className="cross" src="/close.png" alt="" />
            </button>
            <img className="qr" src="/qr.png" alt="" />
            <Button className="completed-button" onClick={handleState}>
              사용 완료
            </Button>
          </Modal>
        )}
      </Wrapper>
    </OrderStyle>
  );
};

export default OrderList;
