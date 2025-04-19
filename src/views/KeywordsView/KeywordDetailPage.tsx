import { getKeyword, getKeywords } from "@/api/keywords";
import { generateExampleStream, generateExplanationStream, getRelatedKeywords } from "@/api/gemini";
import KeywordDetail from "./KeywordDetail";
import { message, Spin, Select, Card, Row, Col, Typography } from "antd";
import ReactMarkdown from 'react-markdown';
import { useRequest } from "ahooks";
import { KeywordData, KeyWordQuery } from "@/types/keywords";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button, Divider, List, Tag } from "antd";

export default function KeywordDetailPage() {
  const { t } = useTranslation('views');
  const [selectedKeywordId, setSelectedKeywordId] = useState<number | null>(
    null
  );
  const [keywordsList, setKeywordsList] = useState<KeywordData[]>([]);
  
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
      onError: () => message.error(t("keywords.detail.fetchKeywordsFailed")),
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
      onError: () => message.error(t("keywords.detail.fetchKeywordDetailFailed")),
    }
  );

  // 获取AI解释
  const { data: explanation, loading: isGenerating } = useRequest(
    async () => {
      if (!keyword?.word) return "";
      let result = "";
      try {
        for await (const text of generateExplanationStream(keyword.word)) {
          result = text;
        }
        return result;
      } catch {
        message.error(t("keywords.detail.generateExplanationFailed"));
        return t("keywords.detail.cannotGetExplanation");
      }
    },
    {
      cacheKey: `explanation_${keyword?.word}`,
      refreshDeps: [keyword?.word],
    }
  );

  // 相关关键词推荐逻辑
  useEffect(() => {
    if (!keyword || !keywordsList.length) return;
    
    // 使用AI获取语义相关推荐
    const fetchRelatedKeywords = async () => {
      try {
        const refWords = keywordsList.map(item => item.word);
        const relatedWords = await getRelatedKeywords(keyword.word, refWords);
        
        if (relatedWords.length > 0) {
          // 优先使用AI推荐
          const related = keywordsList.filter(
            item => relatedWords.includes(item.word)
          ).slice(0, 5);
          setRelatedKeywords(related);
        } else {
          // 备选方案：基于同分类推荐
          const related = keywordsList.filter(
            (item) => item.id !== keyword.id && item.category_id === keyword.category_id
          ).slice(0, 5);
          setRelatedKeywords(related);
        }
      } catch {
        // 出错时使用简单分类推荐
        const related = keywordsList.filter(
          (item) => item.id !== keyword.id && item.category_id === keyword.category_id
        ).slice(0, 5);
        setRelatedKeywords(related);
      }
    };
    
    fetchRelatedKeywords();
  }, [keyword, keywordsList]);
  const [relatedKeywords, setRelatedKeywords] = useState<KeywordData[]>([]);
  const [feedback, setFeedback] = useState<null | boolean>(null);
 

  // 获取AI用例
  const { data: example, loading: isGeneratingExample } = useRequest(
    async () => {
      if (!keyword?.word) return "";
      let result = "";
      try {
        for await (const text of generateExampleStream(keyword.word)) {
          result = text;
        }
        return result;
      } catch {
        message.error(t("keywords.detail.generateExampleFailed"));
        return t("keywords.detail.cannotGetExample");
      }
    },
    {
      cacheKey: `example_${keyword?.word}`,
      refreshDeps: [keyword?.word],
    }
  );

  return (
    <div style={{ padding: 24 }}>
      <Select
        ref={selectRef}
        style={{ width: 300, marginBottom: 20 }}
        placeholder={t("keywords.detail.selectKeyword")}
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
            <>
              <KeywordDetail keyword={keyword} />
              <Divider />
              <Card title={t("keywords.detail.relatedKeywords") || "相关关键词推荐"} size="small">
                {relatedKeywords.length ? (
                  <List
                    size="small"
                    dataSource={relatedKeywords}
                    renderItem={item => (
                      <List.Item>
                        <Tag color="blue" style={{ cursor: "pointer" }} onClick={() => setSelectedKeywordId(item.id)}>{item.word}</Tag>
                      </List.Item>
                    )}
                  />
                ) : (
                  <span>{t("keywords.detail.noRelatedKeywords") || "暂无推荐"}</span>
                )}
              </Card>
            </>
          ) : (
            <div>{t("keywords.detail.selectKeywordToViewDetail")}</div>
          )}
        </Col>
        <Col span={12}>
          <Card title={t("keywords.detail.aiExplanation")}> 
            <Typography>
              {explanation ? (
                <ReactMarkdown>{explanation}</ReactMarkdown>
              ) : (
                isGenerating
                  ? t("keywords.detail.generatingExplanation")
                  : t("keywords.detail.showAIExplanationAfterSelect")
              )}
            </Typography>
            {keyword && (
              <div style={{ marginTop: 12 }}>
                <span>{t("keywords.detail.feedback") || "本解释对你有帮助吗？"}</span>
                <Button
                  type={feedback === true ? "primary" : "default"}
                  size="small"
                  style={{ margin: "0 8px" }}
                  onClick={() => setFeedback(true)}
                >{t("keywords.detail.useful") || "有用"}</Button>
                <Button
                  type={feedback === false ? "primary" : "default"}
                  size="small"
                  onClick={() => setFeedback(false)}
                >{t("keywords.detail.useless") || "无用"}</Button>
                {feedback !== null && (
                  <span style={{ marginLeft: 8, color: feedback ? "#52c41a" : "#f5222d" }}>
                    {feedback ? t("keywords.detail.thankUseful") || "感谢反馈！" : t("keywords.detail.thankUseless") || "我们会改进！"}
                  </span>
                )}
              </div>
            )}
          </Card>
          <Divider />
        </Col>
      </Row>
      <Divider />
      <Row gutter={16}>
        <Col span={24}>
          <Card title={t("keywords.detail.examplesAndReferences") || "用例与文献引用"} size="small">
            <List
              loading={isGeneratingExample}
              size="small"
              dataSource={keyword ? [
                { type: "example", content: example  },
       
              ] : []}
              renderItem={item => (
                <List.Item>
                  <Tag color={item.type === "example" ? "green" : "orange"}>{item.type === "example" ? t("keywords.detail.example") || "示例" : t("keywords.detail.reference") || "文献"}</Tag>
                  <span>{item.content}</span>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
