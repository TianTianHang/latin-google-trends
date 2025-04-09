import { getKeyword, getKeywords } from "@/api/keywords";
import { generateExplanationStream } from "@/api/gemini";
import KeywordDetail from "./KeywordDetail";
import { message, Spin, Select, Card, Row, Col, Typography } from "antd";
import ReactMarkdown from 'react-markdown';
import { useRequest } from "ahooks";
import { KeywordData, KeyWordQuery } from "@/types/keywords";
import { useState, useEffect, useRef } from "react";

export default function KeywordDetailPage() {
  const [selectedKeywordId, setSelectedKeywordId] = useState<number | null>(
    null
  );
  const [keywordsList, setKeywordsList] = useState<KeywordData[]>([]);
  const [explanation, setExplanation] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    hasMore: true,
  });
  const selectRef = useRef(null);

  // 分页获取关键词
  const { loading: keywordsLoading, run: fetchKeywords } = useRequest(
    async () => {
      const response = await getKeywords({
        page: pagination.page,
        page_size: pagination.page_size,
      } as KeyWordQuery);
      return response;
    },
    {
      manual: true,
      onSuccess: (response) => {
        setKeywordsList((prev) => [...prev, ...response.items]);
        setPagination((prev) => ({
          ...prev,
          hasMore: response.items.length >= prev.page_size,
        }));
      },
      onError: () => message.error("获取关键词列表失败"),
    }
  );

  // 初始加载
  useEffect(() => {
    fetchKeywords();
  }, [fetchKeywords]);

  // 滚动加载更多
  const handlePopupScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (
      scrollHeight - scrollTop <= clientHeight + 10 &&
      !keywordsLoading &&
      pagination.hasMore
    ) {
      setPagination((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
      fetchKeywords();
    }
  };

  // 获取选中的关键词详情
  const { data: keyword, loading: detailLoading } = useRequest(
    async () => {
      if (!selectedKeywordId) return null;
      return await getKeyword(selectedKeywordId);
    },
    {
      refreshDeps: [selectedKeywordId],
      onError: () => message.error("获取关键词详情失败"),
    }
  );

  // 获取AI解释
  useEffect(() => {
    if (!keyword?.word) return;

    const fetchExplanation = async () => {
      setIsGenerating(true);
      setExplanation("");

      try {
        for await (const text of generateExplanationStream(keyword.word)) {
          setExplanation(text);
        }
      } catch {
        message.error("生成解释失败");
        setExplanation("无法获取解释");
      } finally {
        setIsGenerating(false);
      }
    };

    fetchExplanation();
  }, [keyword]);

  return (
    <div style={{ padding: 24 }}>
      <Select
        ref={selectRef}
        style={{ width: 300, marginBottom: 20 }}
        placeholder="请选择关键词"
        onChange={(value) => setSelectedKeywordId(value)}
        options={keywordsList.map((item) => ({
          value: item.id,
          label: item.word,
        }))}
        loading={keywordsLoading}
        onPopupScroll={handlePopupScroll}
        showSearch
        filterOption={(input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
        }
      />

      <Row gutter={16}>
        <Col span={12}>
          {detailLoading ? (
            <Spin size="large" />
          ) : keyword ? (
            <KeywordDetail keyword={keyword} />
          ) : (
            <div>请选择关键词查看详情</div>
          )}
        </Col>
        <Col span={12}>
          <Card title="AI解释">
            <Typography>
              {explanation ? (
                <ReactMarkdown>{explanation}</ReactMarkdown>
              ) : (
                isGenerating ? '正在生成解释...' : '选择关键词后显示AI解释'
              )}
            </Typography>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
