import { useState, useEffect, useCallback, useRef, Activity } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Form, Button } from 'react-bootstrap';
import './App.css';
import { getIssueCount, getStarsCount, getMyself } from './services/backlog';

function App() {
  const [backlogUrl, setBacklogUrl] = useState<string>(localStorage.getItem('backlogUrl') || '');
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem('backlogApiKey') || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchData = async () => {
    if (!backlogUrl || !apiKey) {
      setError('Backlog URLとAPIキーを入力してください。');
      return;
    }

    setCompleted(false);
    let ctx = canvasRef.current?.getContext("2d");
    if (ctx == null) return;

    setLoading(true);
    setError(null);

    try {
      const _backlogUrl = backlogUrl.replace(/\/$/, '');
      const myself = await getMyself(_backlogUrl, apiKey);
      const userId = myself.id;

      const newCreatedCount = await getIssueCount(_backlogUrl, apiKey, { createdUserId: [userId] });
      const newCreatedCompletedCount = await getIssueCount(_backlogUrl, apiKey, { createdUserId: [userId], statusId: [4] });
      const newAssignedCount = await getIssueCount(_backlogUrl, apiKey, { assigneeId: [userId] });
      const newAssignedCompletedCount = await getIssueCount(_backlogUrl, apiKey, { assigneeId: [userId], statusId: [4] });
      const newStarsCount = await getStarsCount(_backlogUrl, apiKey, userId);

      const template = new Image();
      template.src = window.location.origin + window.location.pathname + "/template.png"
      template.onload = async () => {
        const image = new Image();
        image.src = _backlogUrl + "/api/v2/users/" + userId + "/icon?apiKey=" + apiKey;
        image.onload = () => {
          ctx!.clearRect(0, 0, 640, 640);
          ctx!.drawImage(template, 0, 0);

          ctx!.drawImage(image, 256, 135, 128, 128);

          ctx!.font = 'bold 60px Sawarabi Gothic, Arial';
          ctx!.fillStyle = "#6CC59D";
          ctx!.textAlign = "right";
          ctx!.fillText(newStarsCount.toString(), 620, 310);
          ctx!.fillText(newCreatedCount.toString(), 620, 405);
          ctx!.font = 'bold 50px Sawarabi Gothic, Arial';
          ctx!.fillText(newCreatedCompletedCount.toString(), 620, 465);
          ctx!.font = 'bold 60px Sawarabi Gothic, Arial';
          ctx!.fillText(newAssignedCount.toString(), 620, 545);
          ctx!.font = 'bold 50px Sawarabi Gothic, Arial';
          ctx!.fillText(newAssignedCompletedCount.toString(), 620, 605);
          setLoading(false);
          setCompleted(true);
        }
      }
    } catch (err) {
      setError('データの取得中にエラーが発生しました。入力情報またはAPIキーの権限をご確認ください。');
      console.error(err);
    }
  };

  const handleFetchData = () => {
    localStorage.setItem('backlogUrl', backlogUrl);
    localStorage.setItem('backlogApiKey', apiKey);
    fetchData();
  };

  return (
    <div className="App">
      <Container className="my-5">
        <h1 className="text-center mb-4">2025 Backlog</h1>

        <Card className="mb-4 shadow">
          <Card.Body>
            <Form>
              <Row className="mb-3">
                <Form.Group as={Col} controlId="formBacklogUrl">
                  <Form.Label>Backlog URL</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="例: https://your-space.backlog.com"
                    value={backlogUrl}
                    onChange={(e) => setBacklogUrl(e.target.value)}
                  />
                </Form.Group>

                <Form.Group as={Col} controlId="formApiKey">
                  <Form.Label>Backlog APIキー</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="APIキーを入力してください"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </Form.Group>
              </Row>
              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                <Button variant="primary" onClick={handleFetchData} disabled={loading}>
                  {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'データを取得'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

        {loading && (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}

        {completed && (
            <p>右クリックで画像をダウンロード</p>
        )}

        <Activity mode={loading ? "hidden" : "visible"}>
          <canvas ref={canvasRef} width={640} height={640} style={{ width: 640, height: 640 }} ></canvas>
        </Activity>
      </Container>
    </div>
  );
}

export default App;
